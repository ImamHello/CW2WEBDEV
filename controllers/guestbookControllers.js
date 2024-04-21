const { title } = require("process");
const guestbookDAO = require("../models/guestbookModel");
const userDAO = require('../models/userModel.js');
const { response } = require("express");
const { verify } = require("crypto");
const { verifyAdmin, verifypantry } = require("../auth/auth.js");
const user_db = new userDAO();
const jwt = require("jsonwebtoken");



const db = new guestbookDAO();
db.init();

exports.show_login = function (req, res) {
  res.render("user/login",{
    title: "login",
  });
};

exports.handle_login = function (req, res) {
  // res.redirect("/new");
  res.redirect("/")
};

exports.landing_page = function (req, res) {
  let accessToken = req.cookies.jwt;
  if (accessToken) {
    try{
      let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        // Token is not expired, proceed with rendering entries
        db.getAllEntries()
          .then((list) => {
            res.render("entries", {
              title: "Guest Book",
              entries: list,
              token: payload.role,
              'nav': true,
            });
          })
          .catch((err) => {
            console.log("promise rejected", err);
          });
  } catch (error) {
    console.error('Token verification failed:', error);

    db.getAllEntries()
      .then((list) => {
        res.render("entries", {
          title: "Guest Book",
          entries: list,
          'nav': true
        });
      })
      .catch((err) => {
        console.log("promise rejected", err);
      });
  }
  }
else {
    db.getAllEntries()
      .then((list) => {
        res.render("entries", {
          title: "Guest Book",
          entries: list,
          'nav': true
        });
      })
      .catch((err) => {
        console.log("promise rejected", err);
      });
  }
};



exports.show_new_entries = function (req, res) {
  res.render("newEntry", {
    title: "Guest Book",
    user: "user",
  });
};

exports.post_new_entry = function (req, res) {
  console.log("processing post-new_entry controller");
  if (!req.body.author) {
    response.status(400).send("Entries must have an author.");
    return;
  }
  db.addEntry(req.body.author, req.body.subject, req.body.contents);
  res.redirect("/loggedIn");
};

exports.show_user_entries = function (req, res) {
  let accessToken = req.cookies.jwt;
  if (accessToken) {
    try{
      let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    let user = req.params.author;
    db.getEntriesByUser(user)
      .then((entries) => {
        res.render("entries", {
          title: "Guest Book",
          user: "user",
          token: payload.role,
          entries: entries,
          'nav':true
        });
      })
      .catch((err) => {
        console.log("Error: ");
        console.log(JSON.stringify(err));
      });  
    }catch(error){
      console.error('Token verification failed:', error);

    db.getAllEntries()
      .then((list) => {
        res.render("entries", {
          title: "Guest Book",
          entries: list,
          'nav': true
        });
      }).catch((err) => {
        console.log("promise rejected", err);
      });
    }
  }
  else{
    let user = req.params.author;
    db.getEntriesByUser(user)
      .then((entries) => {
        res.render("entries", {
          title: "Guest Book",
          user: "user",
          entries: entries,
          'nav':true
        });
      })
      .catch((err) => {
        console.log("Error: ");
        console.log(JSON.stringify(err));
      });  

  }

};

exports.show_register_page = function (req, res) { 
  res.render("user/register",{
    title: "Register"
  });
}

exports.post_new_user = function (req, res) {
  const username = req.body.username;
  const password = req.body.pass;
  const role = "user";
  if (!username || !password) {
    res.send(401, "no user or no password");
    return;
  }

    if (!req.body.username) {
      res.status(404).send("User not found");
      return;
    }

    user_db.create(username, password ,role, (err, newUser) => {
      if (err) {
          res.status(500).send("Error creating user");
          return;
      }

      if (newUser) {
          console.log("register user", username, "password", password);
          res.redirect("/login");
      } else {
          res.status(409).send("User already exists");
      }
  });
};

exports.loggedIn_landing = function (req, res) {
  db.getAllEntries()
    .then((list) => {
      res.render("entries", {
        title: "Guest Book",
        user: "user",
        entries: list,
      });
    })
    .catch((err) => {
      console.log("promise rejected", err);
    });
};

exports.logout = function (req, res) {
  res.clearCookie("jwt").status(200).redirect("/");
};


exports.donate = function (req, res) {
  let accessToken = req.cookies.jwt;
  if (accessToken) {
    try{
      let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        // Token is not expired, proceed with rendering entries
            res.render("user/donate", {
              title: "Donation",
              token: payload.role,
              'nav': true,
            });         
  } catch (error) {
    console.error('Token verification failed:', error);

    res.redirect("login")
  }
  }
else {
  res.redirect("login")
  }
};


exports.createUsers = function (req, res) {
  let accessToken = req.cookies.jwt;
  let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        res.render("user/createUser", {
          title: "Guest Book",
          user: "user",
          token: payload.role,
          'nav':true
        });
      
};

exports.post_createUsers = function (req, res) {
  const username = req.body.username;
  const password = req.body.pass;
  const role = req.body.user_type;


  if (!username || !password) {
    res.send(401, "no user or no password");
    return;
  }

    if (!req.body.username) {
      res.status(404).send("User not found");
      return;
    }

    user_db.create(username, password,role, (err, newUser) => {
      if (err) {
          res.status(500).send("Error creating user");
          return;
      }

      if (newUser) {
          console.log("register user", username, "password", password, role, "role");
          res.redirect("/");
      } else {
          res.status(409).send("User already exists");
      }
  });
};