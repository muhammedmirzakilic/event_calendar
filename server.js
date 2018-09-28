var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var app = express();
var cookieParser = require("cookie-parser");
var exphbs = require("express-handlebars");
var expressValidator = require("express-validator");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongo = require("mongodb");
var mongoose = require("mongoose");

var User = require("./models/user");
var users = require("./routes/users");
mongoose.connect("mongodb://localhost/calendar");
var db = mongoose.connection;
//view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "ui"));

//body parser
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
//static path
app.use(express.static(path.join(__dirname, "ui")));

// Express Session
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

// Connect Flash
app.use(flash());

// Global Vars
app.use(function(req, res, next) {
  //TODO: will be added more detailed messages
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

app.use("/api/users", users);

app.get("/", function(req, res) {
  res.render("index");
});

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

app.post("/api/login", passport.authenticate("local"), function(req, res) {
  console.log(req.user);
  return res.send("accepted");
});
app.get("/api/logout", function(req, res) {
  req.logout();
  res.send("logged out");
});
app.get("/api/check", function(req, res) {
  if (req.isAuthenticated()) res.send("true");
  else {
    res.send("false");
  }
});
app.post("/api/register", function(req, res) {
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

//web app
app.get("/ui", function(req, res) {
  res.status(300).send({ redirect: "/ui" });
  //res.render("index");
});

app.listen(3000, function() {
  console.log("Server started");
});
