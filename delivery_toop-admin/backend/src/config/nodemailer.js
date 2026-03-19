require("dotenv").config({ path: "./src/config/.env" });

const nodemailer = require("nodemailer");

let transport = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASSWORD,
  },
});

// module.exports = transport;
module.exports = {
  transport,
  from_name: process.env.MAILER_NAME,
  from_email: process.env.MAILER_EMAIL,
};
