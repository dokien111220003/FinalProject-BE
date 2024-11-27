const nodemailer = require('nodemailer')
const dotenv = require('dotenv');
dotenv.config()
var inlineBase64 = require('nodemailer-plugin-inline-base64');

const sendEmailCreateOrder = async (email,orderItems) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_ACCOUNT, // generated ethereal user
      pass: process.env.MAIL_PASSWORD, // generated ethereal password
    },
  });
  transporter.use('compile', inlineBase64({cidPrefix: 'somePrefix_'}));

  let listItem = '';D
  const attachImage = []
  orderItems.forEach((order) => {
    listItem += `<div>
    <div>
      You have ordered the product <b>${order.name}</b> with the quantity: <b>${order.amount}</b> and the price is: <b>${order.price} $</b></div>
    </div>`
    attachImage.push({path: order.image})
  })

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.MAIL_ACCOUNT, // sender address
    to: email, // list of receivers
    subject: "You have ordered at ATN Toys", // Subject line
    html: `<div><b>You have ordered successfully at ATN Toys</b></div> ${listItem}`,
    attachments: attachImage,
  });
}

module.exports = {
  sendEmailCreateOrder
}