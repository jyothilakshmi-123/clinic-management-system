const { response } = require('express');
var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');
const doctorHelpers = require('../helpers/doctor-helpers');
const userHelpers = require('../helpers/user-helpers');
const fs = require('fs');
const mime = require('mime');

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
  // console.log(req.body);

  console.log(admin)
  let usersList = userHelpers.getActiveUsersList().then((usersList)=>{
    // console.log(usersList)
  
  
  let doctorsList=  doctorHelpers.getActiveDoctorsList().then((doctorsList)=>{
  let appointmentList=  adminHelpers.getAppointmentList().then((appointmentList)=>{
    console.log(appointmentList)
    
res.render('admin/admin-home',{ admin, doctorsList,usersList,appointmentList})
}) 
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
  console.log(req.body)
  console.log("before crop...."+req.files.Image)
  // console.log("cropped one..."+req.files.Image) 
  doctorHelpers.addDoctor(req.body).then((id)=>{  
    console.log(id)
//     var matches = req.body.base64image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    
//     response = {};
//     console.log("matches........"+matches)
 
//     if (matches.length !== 3) {
//         return new Error('Invalid input string');
//       }
 
//     response.type = matches[1];
//     response.data = new Buffer(matches[2], 'base64');
//     let decodedImg = response;
//     let imageBuffer = decodedImg.data;
//     let type = decodedImg.type;
//     let extension = mime.extension(type);
//     let fileName = "image." + extension;
//     try {
//     fs.writeFileSync("./public/doctor-images/" + fileName, imageBuffer, 'utf8');  
//     return res.send({"status":"success"});
//     } catch (e) {
//     next(e);
// }
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
// doctor block
router.post('/block-doctor',(req,res,next)=>{
  console.log(" printing req bdy in block doctor")
  console.log(req.body)   
  doctorHelpers.blockDoctor(req.body).then(()=>{
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

// user details start from here

//user created

router.get('/add-user',(req,res)=>{ 
  // let admin = req.session.admin
  res.render('admin/add-user')          
})
router.post('/add-user',(req,res)=>{
  console.log(req.body)
  console.log(req.files.Image)
  userHelpers.addUser(req.body).then((id)=>{  
    console.log(id)
    let image = req.files.Image
    image.mv('./public/user-images/'+id+'.jpg',(err,done)=>{
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
// user delete

router.post('/delete-user',(req,res,next)=>{
  console.log(req.body)   
  userHelpers.deleteUser(req.body).then((response)=>{
    // res.json(response)  
    res.redirect('/admin/admin-home')
  })

})
// ------------------------------------------------------
// user block
router.post('/block-user',(req,res,next)=>{
  console.log(" printing req bdy in block user")
  console.log(req.body)   
  userHelpers.blockUser(req.body).then((response)=>{
    // res.json(response)  
    res.redirect('/admin/admin-home')
  })

})

// ------------------------------------------------------
// edit user details
router.get('/edit-user/:id', async(req,res)=>{
  let user =await userHelpers.getUsersList(req.params.id)
  console.log(user)
  res.render('admin/edit-user',{user})
})
router.post('/edit-user/:id',(req,res)=>{
  console.log(req.params.id)
  let id = req.params.id
  userHelpers.updateUser(req.params.id,req.body).then(()=>{
    res.redirect('/admin/admin-home')
    if(req.files.Image){
      let image = req.files.Image
      image.mv('./public/user-images/'+id+'.jpg')
    }
  })
})

module.exports = router;   
     