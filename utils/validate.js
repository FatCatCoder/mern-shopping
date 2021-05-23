const passport = require('passport')
const passportJWT = require("passport-jwt");
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require('../models/User');
require('dotenv').config();


// validate token

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET
},
  function (jwtPayload, done) {
    return User.findById(jwtPayload.user)
    .then(user => {
      return done(null, user);
      }
  ).catch(err => {
    return done(err);
    });
}
))
