import config from '../../config';
import { GET_REGISTRATION, SET_REGISTRATION } from '../storeTypes';

export const getPreRegistrationID = () => {
  return { type: GET_REGISTRATION, payload: 'Learn about actions' };
};

export const setPreRegistrationID = () => {
  return { type: SET_REGISTRATION, payload: 'Learn about actions' };
};
