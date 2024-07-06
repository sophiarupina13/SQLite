const crypto = require('crypto');
const { randomBytes } = require('crypto');
const { insertNewUser, checkIfUserExists, insertSessionId, deleteSessionId, getSessionBySessionId } = require('../services/authServices.js'); 

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

async function signUpPostController(req, res) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const { name, password } = JSON.parse(body);
      
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

async function logInPostController(req, res) {
  let body = '';
  req.on('data', (chunk) => {
      body += chunk.toString();
  });
  req.on('end', async () => {
      try {
          const { name, password } = JSON.parse(body);
          
          if (!name || !password) {
              res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
              res.end('<html><body><h1>Отсутствуют данные в запросе</h1></body></html>');
              return;
          }
          const user = await checkIfUserExists(name);
          if (!user || !checkPassword(password, user.passwordHashed, user.salt)) {
            res.writeHead(401, { 'Content-Type': 'text/plain' });
            res.end('Неправильное имя пользователя или пароль');
            return;
          }
          const sessionId = generateSessionId();
          await insertSessionId(user.id, sessionId);
          const encodedName = encodeURIComponent(name);
          res.setHeader('Set-Cookie', [
            `session_id=${sessionId}; HttpOnly; Max-Age=86400; Path=/`,
            `name=${encodedName}; Max-Age=86400; Path=/`
          ]);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: 'Login successful', name: user.name }));    
      } catch (error) {
          console.error(error);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server Error');
      }
  });
}

async function logOutPostController(req, res) {
  try {
    const sessionId = req.headers.cookie.session_id;
    if (sessionId) {
      await deleteSessionId(sessionId);
    }
    res.setHeader('Set-Cookie', [
      `session_id=; HttpOnly; Max-Age=0; Path=/`,
      `name=; Max-Age=0; Path=/`
    ]);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<html><body><h1>Вы успешно вышли из системы</h1></body></html>');
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<html><body><h1>Ошибка сервера</h1></body></html>');
  }
}

function checkAuthController(req) {
  const sessionId = req.headers.cookie.session_id;
  const res = sessionId ? true : false;
  return res;
}

module.exports = { signUpPostController, logInPostController, logOutPostController, checkAuthController };