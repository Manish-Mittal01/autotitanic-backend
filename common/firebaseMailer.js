const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const { transporter } = require("../firebaseConfig");
const cors = require("cors")({ origin: true });

module.exports.sendMail = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // getting dest email by query string
    const dest = req.query.dest;

    const mailOptions = {
      from: "Autotitanic <autotitanic.com>", // Something like: Jane Doe <janedoe@gmail.com>
      to: "mittalmanish938@gmail.com",
      subject: "test", // email subject
      html: `<p style="font-size: 16px;">test it!!</p>
                <br />
            `, // email content in HTML
    };

    // returning result
    return transporter.sendMail(mailOptions, (erro, info) => {
      if (erro) {
        return res.send(erro.toString());
      }
      return res.send("Sended");
    });
  });
});
