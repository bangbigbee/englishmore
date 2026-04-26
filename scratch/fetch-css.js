const http = require('http');
const fs = require('fs');

http.get('http://localhost:3000/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const match = data.match(/href="(\/_next\/static\/css\/[^"]+\.css)"/);
    if (match) {
      console.log('Found CSS URL:', match[1]);
      http.get('http://localhost:3000' + match[1], (cssRes) => {
        let cssData = '';
        cssRes.on('data', (chunk) => cssData += chunk);
        cssRes.on('end', () => {
          fs.writeFileSync('test.css', cssData);
          console.log('Saved to test.css');
        });
      });
    } else {
      console.log('CSS URL not found');
    }
  });
});
