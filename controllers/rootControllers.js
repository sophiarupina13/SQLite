// import fs from 'fs';
// import { TemplateEngine } from '../templateEngine.js';

// function escapeHtml(unsafe) {
//   return unsafe
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");
// }

// export function rootGetController(req, res) {
//   const filePath = './public/html/index.html'; 
  
//   fs.readFile(filePath, (err, data) => {
//     if (err) {
//       console.error(err);
//       res.writeHead(500, { 'Content-Type': 'text/plain' });
//       res.end('Internal Server Error');
//     } else {
//       res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//       res.end(data);
//     }
//   });
// }

// export async function rootStyleGetController(req, res) {
//   const stylePath = './public/css/style.css';
  
//   fs.readFile(stylePath, (err, data) => {
//     if (err) {
//       console.error(err);
//       res.writeHead(500, { 'Content-Type': 'text/plain' });
//       res.end('Internal Server Error');
//     } else {
//       res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
//       res.end(data);
//     }
//   });
// }

// export function rootPostController(req, res) {
//   let body = '';
//   req.on('data', chunk => {
//     body += chunk.toString();
//   });

//   req.on('end', () => {
//     try {
//       const { name, email } = JSON.parse(body);
//       if (!name || !email) {
//         res.writeHead(400, { 'Content-Type': 'text/plain' });
//         res.end('Name and email are required.');
//         return;
//       }
//       res.writeHead(200, { 'Content-Type': 'application/json' });
//       res.end(JSON.stringify({ message: 'Data received successfully.', name, email }));
//     } catch (error) {
//       console.error(error);
//       res.writeHead(500, { 'Content-Type': 'text/plain' });
//       res.end('Server Error');
//     }
//   });
// }

// export function lastCommentGetController(req, res) {
//   try {
//     let data = fs.readFileSync('./public/template/lastcomment.html').toString();
//     const comment = comments.at(-1).comment;
//     data = data.replace(/{{comment}}/, escapeHtml(comment));
//     data = data.replace(/{{name}}/, escapeHtml(comments.at(-1).name));
//     const contentLength = Buffer.byteLength(data, 'utf-8');
//     res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': contentLength });
//     res.end(data);
//   } catch (error) {
//     console.error(error);
//     res.writeHead(500, { 'Content-Type': 'text/plain' });
//     res.end('Server Error');
//   }
// }

// import fs from 'fs';

// export function rootGetController(req, res) {
//   const filePath = './homepage/html/index.html';
  
//   fs.readFile(filePath, (err, data) => {
//     if (err) {
//       console.error(err);
//       res.writeHead(500, { 'Content-Type': 'text/plain' });
//       res.end('Internal Server Error');
//     } else {
//       res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//       res.end(data);
//     }
//   });
// }

// export function rootGetStyleController(req, res) {
//   const stylePath = './homepage/css/style.css';
  
//   fs.readFile(stylePath, (err, data) => {
//     if (err) {
//       console.error(err);
//       res.writeHead(500, { 'Content-Type': 'text/plain' });
//       res.end('Internal Server Error');
//     } else {
//       res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
//       res.end(data);
//     }
//   });
// }