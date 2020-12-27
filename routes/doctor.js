const { response } = require('express');
var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const doctorHelpers = require('../helpers/doctor-helpers');
const userHelpers = require('../helpers/user-helpers');
const fs = require('fs');
const mime = require('mime');
var download = require('download-file')
 



router.get('/', function(req, res, next) {
    console.log("....................... in get" + req.body)
   
    
    if(req.session.doctor){
      res.redirect("/doctor/doctor-home")
    }else{
      // res.render('admin/admin-login');
  
      res.render('doctor/doctor-login',{'LoginErr':req.session.doctorLogginErr})  
      req.session.doctorLogginErr = false
    }
    
  });
  router.post('/', function(req,res){
    var email = req.body.drEmail;
    var password = req.body.drPassword;
    console.log("doctor name = "+email+", password = "+password);
    // console.log(req.body)
   
    
    doctorHelpers.doDoctorLogin(req.body)
    .then((response)=>{    
    // console.log("....................... in post:"+response.body)
    if(response.status){
      req.session.doctor = response.doctor
      req.session.doctorloggedIn = true
      res.redirect('/doctor/doctor-home') 
  
    }else{
      req.session.adminLogginErr = "Invalid username or password" 
      res.redirect('/doctor')
    }
  
    })
    
  
  })
  router.get('/logout',(req,res)=>{
    req.session.doctor = null
    console.log(req.session.doctor)
    res.redirect('/')
  })
  router.get('/doctor-home', function(req, res, next) {   
    let doctor = req.session.doctor
    doctorHelpers.collectTodaysConfirmedAppointments(req.session.doctor._id).then((todaysConfirmedAppointments)=>{
    doctorHelpers.collectUpcomingConfirmedAppointments(req.session.doctor._id).then((upcomingConfirmedAppointments)=>{
      doctorHelpers.collectExpiredAppointments(req.session.doctor._id).then((expiredAppointments)=>{
    doctorHelpers.collectConsultedAppointments(req.session.doctor._id).then((consultedAppointments)=>{
    doctorHelpers.collectPendingAppointments(req.session.doctor._id).then((pendingAppointments)=>{
    doctorHelpers.collectCancelledAppointments(req.session.doctor._id).then((cancelledAppointments)=>{
    doctorHelpers.collectMyPatients(req.session.doctor._id).then((myPatients)=>{
    doctorHelpers.collectPrescription(req.session.doctor._id).then((prescriptions)=>{
        
       
        
    res.render('doctor/doctor-home',{doctor, todaysConfirmedAppointments,upcomingConfirmedAppointments,expiredAppointments,
       consultedAppointments, pendingAppointments, cancelledAppointments, myPatients, prescriptions})
    })
    })
    })
    })
    })
    })
    })
    })
  });
  router.post('/consulted',(req,res,next)=>{      
    console.log(req.body)       
    doctorHelpers.consultedAppointments(req.body).then((response)=>{
    //   res.json(response)  
      res.redirect('/doctor/doctor-home')  
    })
    
  
  })
  router.post('/confirm-appointment',(req,res,next)=>{
    console.log(req.body)   
    doctorHelpers.doConfirmAppointments(req.body).then((response)=>{
      // res.json(response)  
      res.redirect('/doctor/doctor-home')
    })
  
  })
  router.post('/cancel-appointment',(req,res,next)=>{
    console.log(req.body)   
    doctorHelpers.doCancelAppointments(req.body).then((response)=>{
      // res.json(response)  
      res.redirect('/doctor/doctor-home')
    })
  
  })
  router.post('/export-to-excel',(req,res,next)=>{  
    console.log("convertttt id")   
    console.log(req.body)      
    doctorHelpers.exportToExcel(req.body).then((response)=>{
      // res.json(response) 
      console.log(response)
      res.redirect('/doctor/doctor-home')
    })
  
  })
  router.get('/edit-doctor/:id', async(req,res)=>{
    let doctor =await doctorHelpers.getDoctorsList(req.params.id)
    console.log(doctor)
    res.render('doctor/edit-doctor',{doctor})
  })
  router.post('/edit-doctor/:id',(req,res)=>{
    console.log(req.params.id)
    let id = req.params.id
    doctorHelpers.updateDoctor(req.params.id,req.body).then(()=>{
      res.redirect('/doctor/doctor-home')
      if(req.files.Image){
        let image = req.files.Image
        image.mv('./public/doctor-images/'+id+'.jpg')
      }
    })
  })


module.exports = router; 