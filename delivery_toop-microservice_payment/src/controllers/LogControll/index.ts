import {Request, Response, NextFunction} from 'express';

export default {
  index(req: Request, res: Response, next: NextFunction): void {
    console.log('\x1b[36m%s\x1b[0m', `${req.method} ${req.originalUrl}`);

    res.on('finish', () => {
      console.log(
        '\x1b[36m%s\x1b[0m',
        `${res.statusCode} ${res.statusMessage}; ${
          res.get('Content-Length') || 0
        }b sent`,
      );
      console.log('--------');
    });

    return next();
  },
};
