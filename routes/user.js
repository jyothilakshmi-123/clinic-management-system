var express = require('express');
var router = express.Router();
const doctorHelpers = require('../helpers/doctor-helpers');

/* GET home page. */
router.get('/', function(req, res, next) {
  let doctorsList=  doctorHelpers.getActiveDoctorsList().then((doctorsList)=>{
    console.log(doctorsList)
 
  res.render('user/user-home' , {user:true, doctorsList});
})
});

module.exports = router;
