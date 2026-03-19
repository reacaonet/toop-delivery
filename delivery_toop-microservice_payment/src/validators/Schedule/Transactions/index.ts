import validator from 'validator';
import {TypeValidatePost} from './types';
import moment from 'moment';

const validatePost = (post: TypeValidatePost): string | boolean => {
  const {
    initialDate,
    finalDate,
    page,
    pageSize,
    eventStatus,
  } = post;

  if (!initialDate || !moment(initialDate).isValid()) {
    return 'Enter a valid date';
  }

  if (!finalDate || !moment(finalDate).isValid()) {
    return 'Enter a valid date';
  }

  if ( Number(`${page}`) <= 0 ) {
    return 'Enter a valid page ';
  }

  if ( Number(`${pageSize}`) <= 0 ) {
    return 'Enter a valid pageSize ';
  }

  if ( !eventStatus ) {
    return 'Enter a valid eventStatus ';
  }

  return true;
};

export default validatePost;
