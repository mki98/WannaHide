const nodemailer = require("nodemailer");
require("dotenv").config();

exports.sendMail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERV,

    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const options = {
    from: `WannaHide Team <${process.env.EMAIL}>`,
    to,
    subject,
    text,
  };
  transporter.sendMail(options, (error, info) => {
    if (error) {
      console.log(error);
      throw error;
    } else {
      console.log(info);
      return info;
    }
  });
};
