import nodemailer from "nodemailer";
import dbConnect from '../../lib/dbConnect'
const { User } = require('../../models/Email.cjs');
var randomstring = require("randomstring");

export default async(req, res) => {
  await dbConnect();
  const {login} = req.body;
  const randomString = randomstring.generate();
  const link = new URL(randomString, process.env.APP_URL);
  const user = await User.find({login});
  await User.findByIdAndUpdate(user[0]._id, {link: link.href}, {new: true});
  const USER = process.env.SMTP_USER;
  const PASS = process.env.SMTP_PASS;
  let transporter = nodemailer.createTransport({
    host: 'minfinlnr.su',
    port: 465,
    secure: true,
    auth: {
      user: USER,
      pass: PASS,
    },
  })
  try {
    await transporter.sendMail({
      from: `"Минфин ЛНР" <${process.env.SMTP_USER}>`,
      to: req.body.login,
      subject: 'Сообщение от Минфина ЛНР',
      text: 'This message was sent from Node js server.',
      html:
        `Это <i>сообщение</i> было отправлено от <strong>Минфина ЛНР</strong>. Вы успешно зарегистрированы на сайте телефонной книги Минфина ЛНР. Для входа на сайт телефонной книги Минфина ЛНР используйте следующую ссылку - <a href="${link.href}">Войти</a>.`,
    })
  } catch(err) {
    console.log(err);
    res.status(400).json({ success: false })
  }
  
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end();
};