var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()
const passport = require('passport')
const bodyParser = require('body-parser');
var flash=require("connect-flash");



var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
var doctorRouter = require('./routes/doctor');

var db = require('./config/connection');
var session = require('express-session');
var hbs = require('express-handlebars');
// const H = require('just-handlebars-helpers');



var app = express();
var fileUpload = require('express-fileupload');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// we create a new folder for default layout and for partials,here we set the path
app.engine( 'hbs', hbs( {
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/'
}));
// var H = hbs.create({
//   helpers:{
//     ifEquals: function(arg1, arg2, options) {
//     return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
//   }}
// })

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use(session({secret:"Key",cookie:{maxAge:6000000}}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
  // res.locals.success_msg = req.flash('success_msg');
  // res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());



db.connect((err)=>{
  if(err){
    console.log("connection error"+err)
  }
  else{
    console.log("database connected to the port 27017")
  }
})

app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/doctor', doctorRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
