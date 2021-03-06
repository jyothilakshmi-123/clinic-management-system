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
var flash = require("connect-flash");


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
  // console.log(req.user.displayName)
  // console.log(req.session)
  let doctorsList = doctorHelpers.getActiveDoctorsList().then((doctorsList) => {
    res.render('user/home', { doctorsList, user });
  })
});
router.get('/user-login', (req, res) => {
  if(req.query.error){
    error = req.flash('error'),
    res.render('user/user-login',{error})
  }
  else{
    res.render('user/user-login')

  }
  
  
})
router.post('/user-login', passport.authenticate('local',
  {
    successRedirect: '/',
    failureRedirect: '/user-login',
    failureFlash: true
  }), function (req, res) {
    
  }
);
router.get('/signup', (req, res) => {    
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  userHelpers.doSignup(req.body).then((response) => {  
    let image = req.body.Image
    var id = response._id    
    const path = './public/user-images/' + id  + '.jpg'
    const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(path, base64Data, { encoding: 'base64' }, function(err) {
      console.log(err)
    });
          
      if (response.error) {
        var error = response.error
        req.flash('error', 'Your account is exists. Please log in.');      
        error = 'Your account is exists. Please log in.'
        res.redirect('/user-login?err=' +encodeURIComponent(error))
      } else {
        req.login(response, function (err) {
          if (!err) {
            res.redirect('/');
          } else {
            var error = 'Something went wrong. Please login with the Credintials'
            res.redirect('/user-login?err='+encodeURIComponent(error))
          }
        })
      }
  })
})

router.get('/user-home', (req, res) => {
  let user = req.user
  userHelpers.collectConfirmedAppointments(req.user._id).then((confirmedAppointments) => {
    userHelpers.collectCancelledAppointments(req.user._id).then((cancelledAppointments) => {
      userHelpers.collectPendingAppointments(req.user._id).then((pendingAppointments) => {
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
      res.render('user/home', {
        error: err.errors[0].description
      });
    } else {
      // Request was successful
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
      res.render('user/phone-login', {
        error: err.errors[0].description,
        id: id
      });
    } else {
      // Verification was successful
      res.redirect('/user-login');
    }
  })
});
router.get('/make-appointment/:id',verifyLogin,  async (req, res, next) => {
  
  user = req.user
  let doctor = await doctorHelpers.getDoctorsList(req.params.id)
  // let pt = userHelpers.doLogin (req.body)
  res.render('user/make-appointment', { doctor,user })
})
router.post('/make-appointment', (req, res) => {
  userHelpers.makeAppointment(req.body).then((response) => {
    if (response.error) {
      var error = response.error
      req.flash('error', 'This time slot is not available now, You can select another time' );
      error = 'This time slot is not available now, You can select another time' 
      res.redirect(req.get('referer',{error}));
    } else {
    res.redirect('/confirmation?appId='+response._id)
    }
  })
})
router.get('/confirmation', (req, res) => {
  let result = userHelpers.collectPresentAppointment(req.query.appId).then((currentAppointments) => {
    res.render('user/confirmation', { user: req.user ,currentAppointments})
  })
})
router.post('/cancelled-appointments', (req, res, next) => {
  userHelpers.cancelledAppointments(req.body).then((response) => { 
    res.redirect('/user-home')
  })
})
router.get('/edit-user/:id', async (req, res) => {
  let user = await userHelpers.getUsersList(req.params.id)
  res.render('user/edit-user', { user })
})
router.post('/edit-user/:id', (req, res) => {
  let id = req.params.id
  userHelpers.updateUser(req.params.id, req.body).then((response) => {
    res.redirect('/user-home')
    let image = req.body.Image  
    const path = './public/user-images/' + id  + '.jpg'
    const base64Data = image.replace(/^data:([A-Za-z-+/]+);base64,/, '');
    fs.writeFileSync(path, base64Data, { encoding: 'base64' }, function(err) {
      console.log(err)
    });
  })
})
router.post('/export-to-excel', (req, res, next) => {
  userHelpers.exportToExcel(req.body).then((response) => {
    res.json(response)
    // res.redirect('/doctor/doctor-home')
  })

})

module.exports = router;
