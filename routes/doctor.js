const { response } = require('express');
var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const doctorHelpers = require('../helpers/doctor-helpers');
const userHelpers = require('../helpers/user-helpers');
const fs = require('fs');
const mime = require('mime');
var download = require('download-file')




router.get('/', function (req, res, next) {
  if (req.session.doctor) {
    res.redirect("/doctor/doctor-home")
  } else {
    // res.render('admin/admin-login');
    res.render('doctor/doctor-login', { 'LoginErr': req.session.doctorLogginErr })
    req.session.doctorLogginErr = false
  }

});
router.post('/', function (req, res) {
  var email = req.body.Doctor_Email;
  var password = req.body.Doctor_Password;
  doctorHelpers.doDoctorLogin(req.body)
    .then((response) => {
      if (response.authenticatedDoctor) {
        if (response.active) {
          req.session.doctor = response.doctor
          req.session.doctorloggedIn = true
          res.redirect('/doctor/doctor-home')

        } else {
          req.session.doctorLogginErr = "You have been temporarily blocked, Please contact admin"
          res.redirect('/doctor')
        }

      } else {
        req.session.doctorLogginErr = "Invalid username or password"
        res.redirect('/doctor')
      }

    })


})
router.get('/logout', (req, res) => {
  req.session.doctor = null
  res.redirect('/')
})
router.get('/doctor-home', function (req, res, next) {
  let doctor = req.session.doctor
  doctorHelpers.collectTodaysConfirmedAppointments(req.session.doctor._id).then((todaysConfirmedAppointments) => {
    doctorHelpers.collectUpcomingConfirmedAppointments(req.session.doctor._id).then((upcomingConfirmedAppointments) => {
      doctorHelpers.collectExpiredAppointments(req.session.doctor._id).then((expiredAppointments) => {
        doctorHelpers.collectConsultedAppointments(req.session.doctor._id).then((consultedAppointments) => {
          doctorHelpers.collectPendingAppointments(req.session.doctor._id).then((pendingAppointments) => {
            doctorHelpers.collectCancelledAppointments(req.session.doctor._id).then((cancelledAppointments) => {
              doctorHelpers.collectMyPatients(req.session.doctor._id).then((myPatients) => {
                doctorHelpers.collectPrescription(req.session.doctor._id).then((prescriptions) => {

                  res.render('doctor/doctor-home', {
                    doctor, todaysConfirmedAppointments, upcomingConfirmedAppointments, expiredAppointments,
                    consultedAppointments, pendingAppointments, cancelledAppointments, myPatients, prescriptions
                  })
                })
              })
            })
          })
        })
      })
    })
  })
});
router.post('/consulted', (req, res, next) => {
  doctorHelpers.consultedAppointments(req.body).then((response) => {
    res.redirect('/doctor/doctor-home')
  })


})
router.post('/confirm-appointment', (req, res, next) => {
  doctorHelpers.doConfirmAppointments(req.body).then((response) => {
    res.redirect('/doctor/doctor-home')
  })

})
router.post('/cancel-appointment', (req, res, next) => {
  doctorHelpers.doCancelAppointments(req.body).then((response) => {
    res.redirect('/doctor/doctor-home')
  })

})
router.post('/export-to-excel', (req, res, next) => {
  console.log("Excel........")
  console.log(req.body)
  doctorHelpers.exportToExcel(req.body).then((response) => {
    res.json(response)
    // res.redirect('/doctor/doctor-home')
  })

})
router.post('/show-history', (req, res, next) => {

  console.log(req.body.user)
  console.log(req.body.doctor)
  doctorHelpers.showHistory(req.body).then((response) => {
    res.json(response)
    // res.redirect('/doctor/doctor-home')
  })

})
router.get('/edit-doctor/:id', async (req, res) => {
  let doctor = await doctorHelpers.getDoctorsList(req.params.id)
  res.render('doctor/edit-doctor', { doctor })
})
router.post('/edit-doctor/:id', (req, res) => {
  let id = req.params.id
  doctorHelpers.updateDoctor(req.params.id, req.body).then(() => {
    res.redirect('/doctor/doctor-home')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/doctor-images/' + id + '.jpg')
    }
  })
})


module.exports = router;



// ---------------

