const express = require('express');
const router  = express.Router();
const User = require('../models/User');

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});


router.get("/profile/:userid", (req, res) => {
  const userid = req.params.userid;
  console.log(userid);

  User.findOne({ "_id": userid }, (err,user) => {
    if (err || !user){
      console.log('error');
      res.render('auth/login',{
        errorMessage: 'no existe el usuario'
      })
      return;
    } else {
      res.render('auth/profile',{user});
    }
});
})

module.exports = router;














module.exports = router;
