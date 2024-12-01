const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const mailOptions = {
  from: process.env.GMAIL_EMAIL,
  to: "braveizumie@outlook.com", // Replace with your email
  subject: "Test Email",
  text: "This is a test email.",
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    console.error("Error sending email:", err);
  } else {
    console.log("Email sent:", info.response);
  }
});
