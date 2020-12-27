var express = require('express');
var router = express.Router();
const doctorHelpers = require('../helpers/doctor-helpers');
const userHelpers = require('../helpers/user-helpers');
const passport = require('passport');
const { json } = require('body-parser');
require('dotenv').config()
require('../helpers/passport-setup');
const fs = require('fs');
const mime = require('mime');


// const twilio = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
var messagebird = require('messagebird')(process.env.MESSAGEBIRD_API_KEY);


const verifyLogin = (req, res, next) => {
  if (req.user) {
    next()
  }
  else {
    res.redirect('/user-login')
  }
}
/* GET home page. */
router.get('/', function (req, res, next) {
  let user = req.user

  let doctorsList = doctorHelpers.getActiveDoctorsList().then((doctorsList) => {
    console.log(doctorsList)

    res.render('user/home', { doctorsList, user });
  })
});

router.get('/user-login', (req, res) => {
  // if (req.user) {
  //   console.log("\n Called sucess block4455................\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
  //   console.log(req.user.userName)
  //   console.log(req)
  //   res.redirect("/user-home")
  // }else{
    res.render('user/user-login' )
  //   req.user = false

  // }
})


router.post('/user-login', passport.authenticate('local',
  {
    successRedirect: '/',
    failureRedirect: '/user-login',
    failureFlash: true
  }
  ));



router.get('/signup', (req, res) => {
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  console.log(req.body)
  console.log(req.files.Image)

  userHelpers.addUser(req.body).then((response) => {
    console.log(response._id)

    let image = req.files.Image
    var id = response._id

    image.mv('./public/user-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.redirect('/')
      }
      else {
        console.log(err)
      }
    })

    // res.redirect('/')

  })

})


// const isGoogleLoggedIn = (req, res, next) => {
//   if (req.user) {
//       next();
//   } else {
//       res.sendStatus(401);
//   }
// }

router.get('/user-home', (req, res) => {
  let user = req.user
  // let user1 = req.user  
  userHelpers.collectConfirmedAppointments(req.user._id).then((confirmedAppointments) => {
    // console.log("confirmed result...."+ result) 



    userHelpers.collectCancelledAppointments(req.user._id).then((cancelledAppointments) => {
      // console.log("confirmed result...."+ result) 



      userHelpers.collectPendingAppointments(req.user._id).then((pendingAppointments) => {
        // console.log("confirmed result...."+ result) 


        userHelpers.collectPrescription(req.user._id).then((prescriptions) => {
          res.render('user/user-home', { user, confirmedAppointments, cancelledAppointments, pendingAppointments, prescriptions })
        })
      })
    })
  })
})


router.get('/failed', (req, res) => res.send('You Failed to log in!'))
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/failed' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);
router.get('/facebook', passport.authenticate('facebook', { scope: 'email,user_photos' }));
router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/failed' }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  }
);

router.get('/logout', (req, res) => {

  req.user = null;
  req.logout();
  res.redirect('/');
})
router.post('/phone-login', function (req, res) {
  var number = req.body.number;

  // Make request to Verify API
  messagebird.verify.create(number, {
    originator: 'Code',
    template: 'Your verification code is %token.'
  }, function (err, response) {
    if (err) {
      // Request has failed
      console.log(err);
      res.render('user/home', {
        error: err.errors[0].description
      });
    } else {
      // Request was successful
      console.log(response);
      res.render('user/phone-login', {
        id: response.id
      });
    }
  })
});
router.post('/verify', function (req, res) {
  var id = req.body.id;
  var token = req.body.token;

  // Make request to Verify API
  messagebird.verify.verify(id, token, function (err, response) {
    if (err) {
      // Verification has failed
      console.log(err);
      res.render('user/phone-login', {
        error: err.errors[0].description,
        id: id
      });
    } else {
      // Verification was successful
      console.log(response);
      res.redirect('/user-login');
    }
  })
});
router.get('/make-appointment/:id', verifyLogin, async (req, res, next) => {
  console.log("id is... :" + req.params.id)
  let user = req.user

  let doctor = await doctorHelpers.getDoctorsList(req.params.id)
  console.log(doctor)
  // let pt = userHelpers.doLogin (req.body)
  res.render('user/make-appointment', { doctor, user })
})
router.post('/make-appointment', (req, res) => {
  console.log(req.body)

  userHelpers.makeAppointment(req.body).then((response) => {
    console.log(response)
    // res.json(true)

    res.redirect('/confirmation')

  })

})
router.get('/confirmation', (req, res) => {
  userHelpers.collectCurrentBookedAppointments(req.user._id).then((currentAppointments) => {
    // console.log("confirmed result...."+ result) 

    console.log("confirmed bDetails...." + currentAppointments)
    res.render('user/confirmation', { user: req.user })

  })
})
router.post('/cancelled-appointments', (req, res, next) => {
  console.log(req.body)
  userHelpers.cancelledAppointments(req.body).then((response) => {
    // res.json(response)  
    res.redirect('/user/user-home')
  })

})





module.exports = router;
