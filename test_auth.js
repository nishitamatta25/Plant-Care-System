fetch('http://localhost:5000/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'testuser1', email: 'test1@test.com', password: 'password123' })
}).then(r => r.json().then(j => console.log('Status:', r.status, 'Body:', j))).catch(console.error);
