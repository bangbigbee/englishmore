const fetch = require('node-fetch');

async function testFetch() {
  const url = 'http://localhost:3000/api/admin/homework/submissions?markAsRead=1';
  try {
    const response = await fetch(url);
    const body = await response.text();
    console.log('Status:', response.status);
    console.log('Body:', body);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testFetch();
