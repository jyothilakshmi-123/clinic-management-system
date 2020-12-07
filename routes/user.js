var express = require('express');
var router = express.Router();
const doctorHelpers = require('../helpers/doctor-helpers');
const patientHelpers = require('../helpers/patient-helpers');
const passport = require('passport')
require('dotenv').config()
require('../helpers/passport-setup');

/* GET home page. */
router.get('/', function(req, res, next) {
  let doctorsList=  doctorHelpers.getActiveDoctorsList().then((doctorsList)=>{
    console.log(doctorsList)
 
  res.render('user/home' , {user:true, doctorsList});
})
});
router.get('/user-login',(req,res)=>{
  if(req.session.patient){
    res.redirect("/user-home")
  }else{
    // res.render('admin/admin-login');

    res.render('user/user-login',{'LoginErr':req.session.patientLogginErr})
    req.session.adminLogginErr = false
  }
  

})      
router.get('/signup',(req,res)=>{   
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  console.log(req.body)
  patientHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.patient = response
    req.session.patientloggedIn = true
    res.redirect('/')
  })

})
router.post('/user-login',(req,res)=>{
  patientHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.patient = response.patient
      req.session.patientloggedIn = true
      res.redirect('/user-home')   
  
    }else{
      req.session.patientLogginErr = "Invalid username or password"   
      res.redirect('/user-login')
    }

  })
})
// const isGoogleLoggedIn = (req, res, next) => {
//   if (req.user) {
//       next();
//   } else {
//       res.sendStatus(401);
//   }
// }
// const verifyLogin = (req,res,next)=>{
//   if(req.session.patientloggedIn){
//     next()
//   }
//   else{
//     res.redirect('/')
//   }
// }
router.get('/user-home',(req,res)=>{
  let patient = req.session.patient
  let user = req.user
  res.render('user/user-home',{patient,name:user.displayName})   
})
router.get('/failed', (req, res) => res.send('You Failed to log in!'))
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/user-home');
  }
);
router.get('/logout', (req, res) => {
  req.session.patient = null;
  req.user = null
  // req.logout();
  res.redirect('/');
})


module.exports = router;
