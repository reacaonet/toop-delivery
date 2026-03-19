import {Request, Response} from 'express';

import {apiBraspagSplitOnboarding} from '../../services/Cielo/api';
import generateToken from '../../services/Cielo/token';

const list = async (req: Request, res: Response): Promise<Response> => {
  try {
    const token = await generateToken();
    const {id} = req.params;

    if (!token) {
      return res.status(400).json({
        message: 'Fail list Subordinates',
        data: token,
      });
    }

    const response = await apiBraspagSplitOnboarding.get(
      `/api/subordinates/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      },
    );

    return res.status(200).json({
      message: 'Successful list Subordinates',
      data: response.data,
    });
  } catch (err) {
    let errPayload = null;
    if (err.response && err.response.data) {
      errPayload = err.response.data;
    } else {
      errPayload = err.message;
    }

    return res.status(400).json({
      message: 'Fail list Subordinates',
      data: errPayload,
    });
  }
};

export default list;
