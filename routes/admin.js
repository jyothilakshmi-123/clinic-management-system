const { response } = require('express');
var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const doctorHelpers = require('../helpers/doctor-helpers');
const patientHelpers = require('../helpers/patient-helpers');

// const verifyLogin = (req,res,next)=>{
//   if(req.session.admin.loggedIn){
//     next()
//   }
//   else{
//     res.redirect('/admin')
//   }
// }
router.get('/', function(req, res, next) {
  console.log("....................... in get" + req.body)
 
  
  if(req.session.admin){
    res.redirect("/admin/admin-home")
  }else{
    // res.render('admin/admin-login');

    res.render('admin/admin-login',{'LoginErr':req.session.adminLogginErr})
    req.session.adminLogginErr = false
  }
  
});
router.post('/', function(req,res){
  var email = req.body.Email;
  var password = req.body.Password;
  console.log("User name = "+email+", password = "+password);
  // console.log(req.body)
 
  
  adminHelpers.doAdminLogin(req.body)
  .then((response)=>{    
  // console.log("....................... in post:"+response.body)
  if(response.status){
    req.session.admin = response.admin
    req.session.admin.loggedIn = true
    res.redirect('/admin/admin-home')

  }else{
    req.session.adminLogginErr = "Invalid username or password" 
    res.redirect('/admin')
  }

  })
  

})
// router.get('/logout',(req,res)=>{
//   req.session.admin = null
//   res.redirect('/')
// })
router.get('/admin-home', (req,res)=>{
  let admin = req.session.admin
  console.log(req.body);

  console.log(admin)
  let patientsList = patientHelpers.getActivePatientsList().then((patientsList)=>{
    console.log(patientsList)
  
  
  let doctorsList=  doctorHelpers.getActiveDoctorsList().then((doctorsList)=>{
    console.log(doctorsList)
    console.log(doctorsList.Specilised)
    
  
  // res.render('admin/admin-home',{ admin,  doctorsList})
 
res.render('admin/admin-home',{ admin, doctorsList,  patientsList})
}) 
})
})
router.get('/logout',(req,res)=>{
  req.session.admin = null
  console.log(req.session.admin)
  res.redirect('/')
})
// -------------------------------------------------------------------------------------------------- 
// Doctors details start from here
// doctor create


router.get('/add-doctor',(req,res)=>{ 
  // let admin = req.session.admin
  res.render('admin/add-doctor')        
})
router.post('/add-doctor',(req,res)=>{
  // console.log(req.body)
  console.log(req.files.Image)
  doctorHelpers.addDoctor(req.body).then((id)=>{  
    console.log(id)
    let image = req.files.Image 
    image.mv('./public/doctor-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        // res.render('admin/add-doctor')  
        res.redirect('/admin/admin-home')
      }
      else{ 
        console.log(err)
      }
    })
    

  })

})
// ------------------------------------------------------
// doctor delete
router.post('/delete-doctor',(req,res,next)=>{
  console.log(req.body)   
  doctorHelpers.deleteDoctor(req.body).then((response)=>{
    // res.json(response)  
    res.redirect('/admin/admin-home')
  })

})
// ------------------------------------------------------
// dorctor update
router.get('/edit-doctor/:id', async(req,res)=>{
  let doctor =await doctorHelpers.getDoctorsList(req.params.id)
  console.log(doctor)
  res.render('admin/edit-doctor',{doctor})
})
router.post('/edit-doctor/:id',(req,res)=>{
  console.log(req.params.id)
  let id = req.params.id
  doctorHelpers.updateDoctor(req.params.id,req.body).then(()=>{
    res.redirect('/admin/admin-home')
    if(req.files.Image){
      let image = req.files.Image
      image.mv('./public/doctor-images/'+id+'.jpg')
    }
  })
})
// ----------------------------------------------------------------------------------------------------------------------------

// patient details start from here

//patient created

router.get('/add-patient',(req,res)=>{ 
  // let admin = req.session.admin
  res.render('admin/add-patient')          
})
router.post('/add-patient',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)
  patientHelpers.addPatient(req.body).then((id)=>{  
    console.log(id)
    let image = req.files.Image
    image.mv('./public/patient-images/'+id+'.jpg',(err,done)=>{
      if(!err){
          
        res.redirect('/admin/admin-home')
      }
      else{ 
        console.log(err)
      }
    })
    

  })

})
// ------------------------------------------------------
// patient delete

router.post('/delete-patient',(req,res,next)=>{
  console.log(req.body)   
  patientHelpers.deletePatient(req.body).then((response)=>{
    // res.json(response)  
    res.redirect('/admin/admin-home')
  })

})
// ------------------------------------------------------
// edit patient details
router.get('/edit-patient/:id', async(req,res)=>{
  let patient =await patientHelpers.getPatientsList(req.params.id)
  console.log(patient)
  res.render('admin/edit-patient',{patient})
})
router.post('/edit-patient/:id',(req,res)=>{
  console.log(req.params.id)
  let id = req.params.id
  patientHelpers.updatePatient(req.params.id,req.body).then(()=>{
    res.redirect('/admin/admin-home')
    if(req.files.Image){
      let image = req.files.Image
      image.mv('./public/patient-images/'+id+'.jpg')
    }
  })
})

module.exports = router;   
     