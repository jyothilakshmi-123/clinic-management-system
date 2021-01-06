const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const facebookStrategy = require('passport-facebook').Strategy
var db = require('../config/connection')
var collection = require('../config/collections')
var objectId = require('mongodb').ObjectID
const bcrypt = require('bcrypt')

passport.serializeUser(function (user, done) {
   done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
},
  function (request, accessToken, refreshToken, profile, done) {
    console.log(profile)
    process.nextTick(function () {
      db.get().collection(collection.USER_COLLECTION).findOne({ 'userEmail': profile._json.email }, function (err, user) {

        if (user) {
          console.log("user found")
          console.log(user)
          return done(null, user); // user found, return that user  
        }
        else {
          db.get().collection(collection.USER_COLLECTION).insertOne({ 'displayName': profile.displayName, 'userEmail': profile._json.email })
        }
        return done(null, profile)


      }

      )

    })
  }
));
passport.use(new facebookStrategy({

  // pull in our app id and secret from our auth.js file
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['displayName', 'email']

},// facebook will send back the token and profile
  function (token, refreshToken, profile, done) {
    console.log(profile)
    console.log("email..............." + profile._json.email)
    console.log('name is:' + profile.displayName)

    process.nextTick(function () {
      db.get().collection(collection.USER_COLLECTION).findOne({ 'userEmail': profile._json.email }, function (err, user) {

        if (user) {
          console.log("user found")
          console.log(user)
          return done(null, user); // user found, return that user  
        }
        else {
          db.get().collection(collection.USER_COLLECTION).insertOne({ 'displayName': profile.displayName, 'userEmail': profile._json.email,'id':profile._json.id })
        }
        return done(null, profile)
      }

      )

    })


  }));
passport.use(new LocalStrategy({
  // passReqToCallback : true,
  usernameField: 'userEmail',
  passwordField: 'userPassword'
},
  function (userEmail, userPassword, done) {
    console.log("login......")
    console.log(userEmail)
    console.log(userPassword)
    db.get().collection(collection.USER_COLLECTION).findOne({ userEmail: userEmail }, function (err, user) {
      if (user) {
        if (user.userPassword) {
          bcrypt.compare(userPassword, user.userPassword).then((status) => {
            if (status) {
              console.log("login success")
              // response.user = user
              // response.status = true
              // resolve(response)
              console.log("printing user------------")
              // console.log(user)
              return done(null, user);
            }
            else {
              console.log("login failed")
              // return done(null, false, { message: 'Incorrect password' })
              return done(null, false, { message: 'Incorrect username or password' })
            }
          })
        }
        else {
          console.log("login failed, incorrect password")
          // return done(null, false, { message: 'Incorrect password' })
          return done(null, false, { message: 'Incorrect username or password' })
        }

      } else {
        console.log("login failed, incorrect user")
        // return done(null, false, { message: 'Incorrect username.' });
        return done(null, false, { message: 'Incorrect username or password' })
      }

    });
  }
));