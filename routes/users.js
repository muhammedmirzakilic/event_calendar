var express = require("express");
var router = express.Router();
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var User = require("../models/user");

passport.use(
  new LocalStrategy(function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if (err) throw err;
      if (!user) {
        return done(null, false, {
          message: "Unknown User"
        });
      }
      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: "Invalid password"
          });
        }
      });
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post("/login", passport.authenticate("local"), function(req, res) {
  console.log(req.user);
  return res.send("accepted");
});
router.get("/logout", function(req, res) {
  req.logout();
  res.send("logged out");
});
router.get("/check", function(req, res) {
  if (req.isAuthenticated()) res.send("true");
  else {
    res.send("false");
  }
});
router.post("/register", function(req, res) {
  console.log(req.body);
  var item = req.body;
  var newUser = new User();
  newUser.name = item.name;
  newUser.surname = item.surname;
  newUser.username = item.username;
  newUser.password = item.password;
  newUser.description = item.description;
  newUser.isActive = true;
  console.log(newUser);
  User.createUser(newUser, function(err, savedUSer) {
    if (err) {
      console.log(err);
      return res.status(500).send();
    }
    console.log("user created");
    return res.status(200).send();
  });
});

module.exports = router;
