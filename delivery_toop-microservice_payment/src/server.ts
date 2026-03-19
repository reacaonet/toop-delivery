import {Express} from 'express';
import https from 'https';
import http from 'http';
import fs from 'fs';

function CreateServer(app: Express): https.Server | http.Server {
  if (process.env.PRODUCTION === 'true') {
    const server = https.createServer(
      {
        key: fs.readFileSync('src/config/https/privkey.pem').toString(),
        cert: fs.readFileSync('src/config/https/fullchain.pem').toString(),
      },
      app,
    );

    return server.listen(process.env.PORT, () => {
      console.log(
        '\x1b[32m',
        `Servidor iniciado na porta: ${process.env.PORT}`,
      );
    });
  }

  const server = http.createServer(app);

  return server.listen(process.env.PORT, () => {
    console.log('\x1b[32m', `Servidor iniciado na porta: ${process.env.PORT}`);
  });
}

export default CreateServer;
