const nodemailer = require("nodemailer");

const firebaseConfig = {
  apiKey: "AIzaSyBbteKMos6_GSE9FlJmkGtRTSK55NQB--k",
  authDomain: "autotitanic-fde97.firebaseapp.com",
  projectId: "autotitanic-fde97",
  // storageBucket: "autotitanic-fde97.appspot.com",
  messagingSenderId: "679017205172",
  appId: "1:679017205172:web:b68f83d918ca7a8327f6e1",
  measurementId: "G-BZFNQW49GF",
  storageBucket: "gs://autotitanic-fde97.appspot.com",
};

module.exports.firebaseConfig = firebaseConfig;

// let transporter = nodemailer.createTransport({
//   service: "gmail",
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     user: "devmanishmittal@gmail.com",
//     pass: "kzqz wwku cyzp zjjq",
//   },
// });

let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "no-reply@manishmittal.tech",
    pass: "Mittal@938",
  },
});

module.exports.transporter = transporter;
