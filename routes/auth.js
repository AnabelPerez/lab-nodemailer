const express = require("express");
const passport = require('passport');
const authRoutes = express.Router();
const User = require("../models/User");
const nodemailer = require('nodemailer');

// Bcrypt to encrypt passwords
const bcrypt = require("bcryptjs");
const bcryptSalt = 10;


authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const rol = req.body.role;

  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);
    const hashConfirmationCode = bcrypt.hashSync(username, salt);

    const newUser = new User({
      username,
      password: hashPass,
      email,
      confirmationCode: hashConfirmationCode,
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "Something went wrong" });
      } else {
        res.redirect("/");
        let transporter = nodemailer.createTransport({  
          service: 'Gmail',
          auth: {
            user: 'anabelizchel@gmail.com',
            pass: '503019.Vha'
          }
        });;
         transporter.sendMail({
           from: '"My Awesome Project 👻" <myawesome@project.com>',
           to: 'anabelizchel@gmail.com', 
           subject: 'subject', 
           text: 'message',
           html: '<b><a href="http://localhost:3000/auth/confirm/'+hashConfirmationCode+'">Confirmar correo</a></b>'
           //html: '<b><a href="http://localhost:3000/auth/confirm/'+hashConfirmationCode.replace('/','.')+'">Confirmar correo</a></b>'
        })
        .then(info => res.render('message', {email, subject, message, info}))
        .catch(error => console.log(error));
      }
    });
  });
});

authRoutes.get("/confirm/:confirmcode", (req, res) => {
  const confirmcode = req.params.confirmcode;
  console.log(confirmcode);

  User.findOne({ "confirmationCode": confirmcode }, (err, user) => {
    if (err || !user)
    {
      res.render("auth/login", {
        errorMessage: "The username doesn't exist"
      });
      console.log(confirmcode);
      return;
    } else{
      User.update({_id: user._id}, { $set: {status:'Active'}})
    .then((response) => {
      res.render("auth/confirm",{user});
    })
    .catch((error) => {
      console.log(error)
    })
    }
});
});


authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = authRoutes;
