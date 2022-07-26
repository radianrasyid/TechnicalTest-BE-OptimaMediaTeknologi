const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'dbihbfpig', 
    api_key: '593289649247291', 
    api_secret: 'EptX8mPaUlGmeqMK0mxn8M10RJU' 
  });

module.exports = cloudinary;