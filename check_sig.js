const fs = require('fs');

const buffer = fs.readFileSync('requirements.pdf');
console.log('First 4 bytes:', buffer.subarray(0, 4).toString('hex'));
console.log('First 4 chars:', buffer.subarray(0, 4).toString('utf8'));
