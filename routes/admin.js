const { response } = require('express');
var express = require('express');
var router = express.Router();
const adminHelpers = require('../helpers/admin-helpers');

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log("....................... in get" + req.body)
 
  
  // if(req.session.admin){
  //   res.redirect("admin/admin-login")
  // }else{
  //   res.render('admin/admin-login',{'loginErr':req.session.adminLogginErr,})
  //   req.session.adminLogginErr = false
  // }
  res.render('admin/admin-login',{admin:true});

});
router.post('/', function(req,res){
  // console.log(req.body)
  // console.log(req.body.Password)
  
  adminHelpers.doAdminLogin(req.body)
  .then((response)=>{    
  // // console.log(response)
  if(response.status){
  //   req.session.admin = response.admin
  //   req.session.admin.loggedIn = true
    res.redirect('/admin/admin-home')

  }else{
  //   req.session.adminLogginErr = "Invalid username or password" 
    res.redirect('/admin')
  }

  })
  

})
// router.get('/logout',(req,res)=>{
//   req.session.admin = null
//   res.redirect('/')
// })
router.get('/admin-home', (req,res)=>{
  res.render('admin/admin-home',{admin:true})
})

module.exports = router;
