const dotenv = require('dotenv');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const fs = require('fs');
const next = require('next');

const env = process.env.LUNA_ENV || 'development';

dotenv.config({ path: `.env.${env}` });

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Replace these with the path to your certificate and key
const options = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
  passphrase: process.env.SSL_PASSPHRASE
};

// app.prepare().then(() => {
//   https.createServer(options, (req, res) => {
//     if (req.url.includes('/api')) {
//       const apiProxy = createProxyMiddleware({
//         target: 'http://localhost:3000',
//         changeOrigin: true,
//         pathRewrite: { [`^/api`]: '/api' },
//       });
//       apiProxy(req, res);
//     } else {
//       handle(req, res);
//     }
//   }).listen(3000, (err) => {
//     if (err) throw err;
//     console.log('> Ready on https://localhost:3000');
//   });
// });

app.prepare().then(() => {
  https.createServer(options, (req, res) => {
    handle(req, res);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on https://localhost:3000');
  });
});