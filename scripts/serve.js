#!/usr/bin/env node
'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Map a request URL to a file below root, or null if it would escape root.
function resolvePath(root, url) {
  let decoded;
  try {
    decoded = decodeURIComponent(url.split('?')[0].split('#')[0]);
  } catch (err) {
    return null;
  }
  if (decoded.includes('\0')) return null;
  if (decoded.endsWith('/')) decoded += 'index.html';
  const file = path.normalize(path.join(root, decoded));
  return file.startsWith(root + path.sep) ? file : null;
}

function createServer(root) {
  return http.createServer((req, res) => {
    const file = resolvePath(root, req.url);
    if (!file) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Bad request');
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..', 'public');
  const port = Number(process.env.PORT) || 8080;
  createServer(root).listen(port, '127.0.0.1', () => {
    console.log(`Serving ${root} at http://127.0.0.1:${port}/`);
  });
}

module.exports = { resolvePath, createServer };
