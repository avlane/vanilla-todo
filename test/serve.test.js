'use strict';

const assert = require('assert');
const http = require('http');
const path = require('path');
const { test } = require('./harness');
const { resolvePath, createServer } = require('../scripts/serve');

const root = path.resolve(__dirname, '..', 'public');

test('resolvePath: maps urls to files', () => {
  assert.strictEqual(resolvePath(root, '/'), path.join(root, 'index.html'));
  assert.strictEqual(resolvePath(root, '/js/app.js?x=1'), path.join(root, 'js', 'app.js'));
  assert.strictEqual(resolvePath(root, '/style.css#top'), path.join(root, 'style.css'));
});

test('resolvePath: refuses to leave the root', () => {
  assert.strictEqual(resolvePath(root, '/../package.json'), null);
  assert.strictEqual(resolvePath(root, '/%2e%2e/package.json'), null);
  assert.strictEqual(resolvePath(root, '/js/../../package.json'), null);
  assert.strictEqual(resolvePath(root, '/bad%'), null);
  assert.strictEqual(resolvePath(root, '/a%00b'), null);
});

function get(port, url) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path: url }, res => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, type: res.headers['content-type'], body }));
    }).on('error', reject);
  });
}

test('server: serves files, 404s and refuses traversal', async () => {
  const server = createServer(root);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const index = await get(port, '/');
    assert.strictEqual(index.status, 200);
    assert.ok(index.type.startsWith('text/html'));
    assert.ok(index.body.includes('<title>Vanilla Todo</title>'));
    assert.strictEqual((await get(port, '/missing.js')).status, 404);
    assert.strictEqual((await get(port, '/%2e%2e/package.json')).status, 400);
  } finally {
    server.close();
  }
});
