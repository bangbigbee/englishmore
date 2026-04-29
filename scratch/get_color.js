const Jimp = require('jimp');

Jimp.read(process.argv[2])
  .then(image => {
    const hex = image.getPixelColor(image.bitmap.width / 2, image.bitmap.height / 2);
    console.log('#' + hex.toString(16).padStart(8, '0').substring(0, 6));
  })
  .catch(err => {
    console.error(err);
  });
