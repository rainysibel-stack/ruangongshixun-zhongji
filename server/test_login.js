const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login with demo/123456...');
        const response = await axios.post('http://127.0.0.1:3000/api/users/login', {
            username: 'demo',
            password: '123456'
        });
        console.log('Login Result:', response.data);
    } catch (error) {
        console.error('Login Failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
