const fs = require('fs');
const jpeg = require('jpeg-js');
const rawImageData = jpeg.decode(fs.readFileSync(process.argv[2]));
const idx = (rawImageData.width * (rawImageData.height >> 1) + (rawImageData.width >> 1)) << 2;
const r = rawImageData.data[idx];
const g = rawImageData.data[idx + 1];
const b = rawImageData.data[idx + 2];
console.log('#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase());
