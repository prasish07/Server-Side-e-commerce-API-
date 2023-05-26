// const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

const sendEmail = async (req, res) => {
  const sendto = req.body.to;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: sendto, // Change to your recipient
    from: "prasishshrestha0099@gmail.com", // Change to your verified sender
    subject: "Subscribe",
    text: "Thank you, to subscribe to our newsletter, Here is your 20$ coupon.",
    html: "<h2>Thank you, to subscribe to our newsletter, <Strong>Here is your 20$ coupon.</Strong></h2>",
  };

  const info = await sgMail.send(msg);
  res.json(info);
};

module.exports = sendEmail;
