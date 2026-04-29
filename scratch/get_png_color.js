const fs = require('fs');
const PNG = require('pngjs').PNG;
const data = fs.readFileSync(process.argv[2]);
const png = PNG.sync.read(data);
const idx = (png.width * (png.height >> 1) + (png.width >> 1)) << 2;
const r = png.data[idx];
const g = png.data[idx + 1];
const b = png.data[idx + 2];
console.log('#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase());
