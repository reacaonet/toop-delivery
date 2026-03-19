import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import https from 'https';
import http from 'http';

import Routes from '../routes';

function HttpServer(app) {
  app
    .use([
      cors(),
      bodyParser.json(),
      bodyParser.urlencoded({ extended: true })
    ])
    .disable('x-powered-by');

  Routes(app);

  if (process.env.PRODUCTION === 'true') {
    https
      .createServer({
        key: fs.readFileSync('src/config/privkey.pem').toString(),
        cert: fs.readFileSync('src/config/fullchain.pem').toString(),
      }, app)
      .listen(process.env.PORT, () => console.log(`Server iniciado na porta: ${process.env.PORT}`));
  } else {
    http
      .createServer(app)
      .listen(process.env.PORT, () => console.log(`Server iniciado na porta: ${process.env.PORT}`));
  }
}

export default HttpServer;