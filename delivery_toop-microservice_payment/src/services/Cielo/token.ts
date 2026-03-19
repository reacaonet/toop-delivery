/* eslint-disable @typescript-eslint/camelcase */
import qs from 'qs';

import {apiBraspag} from './api';
import {TypeToken} from './types';

const generateToken = async (): Promise<TypeToken> => {
  const clienteId = process.env.BRASPAG_CLIENT_ID;
  const clienteSecret = process.env.BRASPAG_CLIENT_SECRET;

  const buff = Buffer.from(`${clienteId}:${clienteSecret}`, 'utf8');
  const base64 = buff.toString('base64');

  apiBraspag.defaults.headers.common['Authorization'] = `Basic ${base64}`;
  apiBraspag.defaults.headers.common['Content-Type'] =
    'application/x-www-form-urlencoded;charset=utf-8';

  const response = await apiBraspag.post(
    '/oauth2/token',
    qs.stringify({grant_type: 'client_credentials'}),
  );

  return response.data;
};

export default generateToken;
