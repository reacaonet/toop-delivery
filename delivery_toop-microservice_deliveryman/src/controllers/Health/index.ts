import {Request, Response} from 'express';

export default {
  index(req: Request, res: Response): Response {
    return res
      .status(200)
      .json({
        message: 'Online',
      });
  },
};
