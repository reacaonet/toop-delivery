const http = require('http');
const options = { hostname: 'localhost', port: process.env.PORT || 8300, path: '/v1/health', method: 'GET', timeout: 2000 };
const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });
req.on('error', () => process.exit(1));
req.on('timeout', () => { req.destroy(); process.exit(1); });
req.end();
