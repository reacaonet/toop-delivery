import axios from 'axios';

const cloudMessage = axios.create({
  baseURL: 'https://fcm.googleapis.com/fcm/send'
});

export default cloudMessage;