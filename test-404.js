const https = require('https');

const req = https.request('https://result-publishing-java-1.onrender.com/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Origin': 'https://result-publishing.onrender.com'
  }
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});
req.write('{"email":"admin@university.edu", "password":"password"}');
req.end();
