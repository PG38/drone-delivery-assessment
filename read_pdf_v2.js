const fs = require('fs');
const pdf = require('pdf-extraction');

let dataBuffer = fs.readFileSync('requirements.pdf');

pdf(dataBuffer).then(function (data) {
    console.log(data.text);
}).catch(function (error) {
    console.error(error);
})
