const axios = require('axios');

const BASE_URL = process.env.ADMIN_API_URL || 'http://localhost:8100';
const AUTH_EMAIL = process.env.TEST_AUTH_EMAIL || '';
const AUTH_PASSWORD = process.env.TEST_AUTH_PASSWORD || '';

const testCORS = async () => {
  if (!AUTH_EMAIL || !AUTH_PASSWORD) {
    console.error('Configure TEST_AUTH_EMAIL and TEST_AUTH_PASSWORD in env');
    process.exit(1);
  }
  try {
    const optionsResponse = await axios.options(`${BASE_URL}/auth`, {
      headers: {
        'Origin': 'http://localhost:4202',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('OPTIONS:', optionsResponse.status);
    
    const postResponse = await axios.post(`${BASE_URL}/auth`, {
      email: AUTH_EMAIL,
      password: AUTH_PASSWORD
    }, {
      headers: {
        'Origin': 'http://localhost:4202',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('POST:', postResponse.status);
    console.log('Data:', postResponse.data);
    
  } catch (error) {
    console.error('Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
};

testCORS();
