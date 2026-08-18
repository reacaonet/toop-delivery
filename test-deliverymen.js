const axios = require('axios');

const BASE_URL = process.env.ADMIN_API_URL || 'http://localhost:8100';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || '';

const testDeliverymen = async () => {
  if (!AUTH_TOKEN) {
    console.error('Configure TEST_AUTH_TOKEN in env');
    process.exit(1);
  }
  try {
    const response = await axios.get(`${BASE_URL}/deliverymen`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.error('Erro:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
    }
  }
};

testDeliverymen();
