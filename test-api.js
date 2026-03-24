async function test() {
  try {
    const loginRes = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@university.edu', password: 'password' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Got token:', token);
    
    const sheetsRes = await fetch('http://localhost:8080/api/teacher/sheets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const sheetsData = await sheetsRes.json();
    console.log('Sheets response:', JSON.stringify(sheetsData, null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
