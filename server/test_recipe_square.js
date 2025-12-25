const http = require('http');

const testRecipeSquare = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/user-recipes/system',
    method: 'GET',
    headers: {
      'Authorization': 'Bearer guest-token'
    }
  };

  console.log('Testing recipe square API...');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      try {
        const response = JSON.parse(data);
        console.log('Response:', JSON.stringify(response, null, 2));
        
        if (res.statusCode === 200) {
          console.log('✅ API works! Recipes count:', response.data?.recipes?.length || 0);
        } else {
          console.log('❌ API returned error');
        }
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.log('❌ Request error:', e.message);
  });

  req.end();
};

testRecipeSquare();
