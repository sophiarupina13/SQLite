import fs from 'fs';

export function rootGetController(req, res) {
  const filePath = './public/html/index.html';
  
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

export function rootGetStyleController(req, res) {
  const stylePath = './public/css/style.css';
  
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