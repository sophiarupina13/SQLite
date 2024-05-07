import http from 'http';
import fs from 'fs';

export class VanillaApp {
  constructor() {
    this.routes = {};
    this.staticFiles = {};
  }

  add(method, url, handler) {
    if (!this.routes[url]) {
      this.routes[url] = {};
    }
    this.routes[url][method] = handler;
  }

  listen(port, host, callback) {
    const server = http.createServer((req, res) => {
      let handler;
      for (let url in this.routes) {
        if (req.url.startsWith(url)) {
          handler = this.routes[url][req.method];
          break;
        }
      }
      if (handler) {
        handler(req, res);
      } else if (this.staticFiles[req.url]) {
        const filePath = this.staticFiles[req.url];
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
          } else {
            res.writeHead(200);
            res.end(data);
          }
        });
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(port, host, callback);
  }

  static(files) {
    this.staticFiles = files;
  }
}