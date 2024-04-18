const { title } = require("process");
const guestbookDAO = require("../models/guestbookModel");
const userDAO = require('../models/userModel.js');
const user_db = new userDAO();

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
  db.getAllEntries()
    .then((list) => {
      res.render("entries", {
        title: "Guest Book",
        entries: list,
      });
    })
    .catch((err) => {
      console.log("promise rejected", err);
    });
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
  let user = req.params.author;
  db.getEntriesByUser(user)
    .then((entries) => {
      res.render("entries", {
        title: "Guest Book",
        user: "user",
        entries: entries,
      });
    })
    .catch((err) => {
      console.log("Error: ");
      console.log(JSON.stringify(err));
    });
};

exports.show_register_page = function (req, res) {
  res.render("user/register");
};

exports.post_new_user = function (req, res) {
  const username = req.body.username;
  const password = req.body.pass;

  if (!username || !password) {
    res.send(401, "no user or no password");
    return;
  }

    if (!req.body.username) {
      res.status(404).send("User not found");
      return;
    }

    user_db.create(username, password, (err, newUser) => {
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
