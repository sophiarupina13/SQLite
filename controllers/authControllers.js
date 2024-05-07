import fs from 'fs';
import crypto from 'crypto';
import { randomBytes } from 'crypto';
import { decode } from 'querystring';
import { insertNewUser, checkIfUserExists, insertSessionId, deleteSessionId, getSessionBySessionId } from '../services/authServices.js'; 

function generateSalt() {
  return randomBytes(16).toString('hex');
}

function generateSessionId() {
  return randomBytes(16).toString('hex');
}

async function hashPassword(password, salt) {
  return new Promise((resolve, reject) => {
    const params = {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 32 * 1024 * 1024, 
    };
    crypto.scrypt(password.normalize('NFKC'), salt, 64, params, (err, derivedKey) => {
      if (err) {
        reject(err);
      } else {
        resolve(derivedKey.toString('hex'));
      }
    });
  });
}

async function checkPassword(password, passwordHashed, salt) {
  const hashedPassword = await hashPassword(password, salt);
  return hashedPassword === passwordHashed;
}

export async function signUpPostController(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { name, password } = decode(body);
      
      if (!name || !password) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Введите имя и пароль');
        return;
      }
      const userExists = await checkIfUserExists(name);
      if (userExists) {
        res.writeHead(409, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<html><body><h1>Ошибка: пользователь с таким именем уже существует</h1></body></html>');
        return;
      }
      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);
      await insertNewUser(name, hashedPassword, salt);
      res.writeHead(201, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<html><body><h1>Регистрация прошла успешно!</h1></body></html>');
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server Error');
    }
  });
}


export async function signUpGetController(req, res) {
  const filePath = './signup/index.html';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    }
  });
}


export async function signUpStyleGetController(req, res) {
  const stylePath = './signup/style.css';
  
  fs.readFile(stylePath, (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end(data);
    }
  });
}

export async function logInGetController(req, res) {
  const filePath = './login/index.html';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    }
  });
}

export async function logInStyleGetController(req, res) {
  const stylePath = './login/style.css';
  
  fs.readFile(stylePath, (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end(data);
    }
  });
}

export async function logInPostController(req, res) {
  let body = '';
  req.on('data', (chunk) => {
      body += chunk.toString();
  });
  req.on('end', async () => {
      try {
          const { name, password } = decode(body);
          
          if (!name || !password) {
              res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<html><body><h1>Отсутствуют данные в запросе</h1></body></html>');
              return;
          }
          const user = await checkIfUserExists(name);
          if (!user || !checkPassword(password, user.passwordHashed, user.salt)) {
              res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<html><body><h1>Неправильное имя пользователя или пароль</h1></body></html>');
              return;
          }
          const sessionId = generateSessionId();
          await insertSessionId(user.id, sessionId);
          res.setHeader('Set-Cookie', `session_id=${sessionId}; HttpOnly; Max-Age=86400`);
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<html><body><h1>Вход выполнен успешно</h1></body></html>');
      } catch (error) {
          console.error(error);
          res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<html><body><h1>Ошибка сервера</h1></body></html>');
      }
  });
}

export async function logOutPostController(req, res) {
  try {
    const cookies = req.headers.cookie;
    const sessionId = cookies ? cookies.split(';').find(cookie => cookie.trim().startsWith('session_id=')).split('=')[1] : null;
    if (sessionId) {
      await deleteSessionId(sessionId);
    }
    res.setHeader('Set-Cookie', `session_id=; HttpOnly; Max-Age=0`);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<html><body><h1>Вы успешно вышли из системы</h1></body></html>');
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<html><body><h1>Ошибка сервера</h1></body></html>');
  }
}

export async function checkSessionId(req) {
  const cookies = req.headers.cookie;
  const sessionId = cookies ? cookies.split(';').find(cookie => cookie.trim().startsWith('session_id=')).split('=')[1] : null;
  if (sessionId) {
    const session = await getSessionBySessionId(sessionId);
    return session ? true : false;
  }
  return false;
}