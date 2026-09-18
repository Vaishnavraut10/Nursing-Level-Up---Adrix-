const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const express = require('express');
const healthRoutes = require('../src/routes/health');

function request(server, path) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const request = http.get({
      hostname: '127.0.0.1',
      port: address.port,
      path,
    }, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        resolve({ statusCode: response.statusCode, body: JSON.parse(body) });
      });
    });
    request.on('error', reject);
  });
}

test('GET /api/health returns an OK response', async () => {
  const app = express();
  app.use('/api', healthRoutes);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });

  try {
    const response = await request(server, '/api/health');
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
