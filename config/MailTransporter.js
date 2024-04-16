const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GOOGLE_MAIL,
    pass: process.env.GOOGLE_AUTH
  }
});

module.exports = transporter;