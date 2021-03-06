////////////////////// Setup Section Start //////////////////////

// hids the sensitive information
require("dotenv").config();

const express = require("express");
const ejs = require("ejs");
const mongoose = require ("mongoose");
const port = process.env.PORT || 3000;

// Level 2 Encryption
// const encrypt = require("mongoose-encryption");

// Level 3 Encryption
// const md5 = require("md5");

// Level 4 Encryption
// const bcrypt = require("bcrypt");
// const { hash } = require("bcrypt");
// const saltRounds = 10;

// Level 5 Encryption
// let session = require("express-session");
// const passport = require("passport");
// const passportLocalMongoose = require("passport-local-mongoose");

// Level 6 Encryption
let session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
let GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

// Level 5 Encryption
// app.use(session({
//     secret: process.env.SECRET,
//     resave: false,
//     saveUninitialized: false
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// Level 6 Encryption
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.DB_URL);

////////////////////// Setup Section End //////////////////////

////////////////////// Secure Schema Section Start //////////////////////

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
});

// Level 5 Encryption
// userSchema.plugin(passportLocalMongoose);

// Level 6 Encryption
userSchema.plugin(findOrCreate);

// Level 6 Encryption
userSchema.plugin(passportLocalMongoose);

// Level 1 Encryption
// extracts the sensitive information
// const secret = process.env.SECRET;

// Level 2 Encryption
// userSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", userSchema);

// Level 5 Encryption
// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// Level 6 Encryption
passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRETS,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

////////////////////// Secure Schema Section End //////////////////////

////////////////////// Get Section Start //////////////////////

app.get("/", function (req, res) {
    res.render("home");
})

app.get("/secrets", function (req, res) {
    // Level 5 Encryption
    // if(req.isAuthenticated()) {
    //     res.render("secrets");
    // } else {
    //     res.redirect("/login")
    // }

    // Level 6 Encryption
    if(req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login")
    }
})

app.get("/login", function (req, res) {
    res.render("login");
})

app.get("/register", function (req, res) {
    res.render("register");
})

app.get("/auth/google", 
    passport.authenticate('google', {scope: ["profile"]}),
);

// Level 6 Encryption
app.get("/auth/google/secrets", 
    passport.authenticate("google", {failureRedirect: "/login"}),
        function(req, res) {
            // Successful authentication, redirect secrets.
            res.redirect("/secrets");
        }
);

////////////////////// Get Section End //////////////////////

////////////////////// Post Section Start //////////////////////

app.post("/login", function(req, res) {
    // const username = req.body.username;

    // // Level 3 Encryption
    // // const password = md5(req.body.password);

    // const password = req.body.password;

    // User.findOne({
    //     email: username
    // }, function(err, foundUser) {
    //     if(!err) {
    //         if(foundUser) {
    //             // Level 4 Encryption
    //             // bcrypt.compare(password, foundUser.password, function(error, result) {
    //             //     if(result === true) {
    //             //         res.render("secrets");
    //             //     } else {
    //             //         res.send("Wrong Password");
    //             //     }
    //             // })
    //         }
    //     } else {
    //         console.log(err);
    //     }
    // })

    // Level 5 Encryption
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err) {
        if(err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets");
            })
        }
    })
})

app.post("/register", function(req, res) {
    // Level 4 Encryption
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     const newUser = new User({
    //         email: req.body.username,
    //         password: hash
    //     });

    //     newUser.save(function(err) {
    //         if(err) {
    //             console.log(err);
    //         } else {
    //             res.render("secrets");
    //         }
    //     })
    // })

    // Level 3 Encryption
    // const newUser = new User({
    //     email: req.body.username,
    //     password: md5(req.body.password)
    // });

    // newUser.save(function(err) {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         res.render("secrets");
    //     }
    // })

    // Level 5 Encryption
    User.register(
        {username: req.body.username},
        req.body.password,
        function(err, user) {
            if(err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/secrets");
                })
            }
        }
    )
})

////////////////////// Post Section End //////////////////////

////////////////////// Main Function Start //////////////////////

app.listen(port, () => {
    console.log("Server started on port " + port);
})

////////////////////// Main Function End //////////////////////