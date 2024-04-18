const bcrypt = require("bcrypt");
const userDAO = require('../models/userModel.js');
const jwt = require("jsonwebtoken");
const user_db = new userDAO();



exports.login = function (req, res,next) {
  let username = req.body.username;
  let password = req.body.password;

  user_db.lookup(username, function (err, user) {
    if (err) {
      console.log("error looking up user", err);
      return res.status(401).send();
    }
    if (!user) {
      console.log("user", user, " not found");
      return res.redirect('/register');
    }
    //compare provided password with stored password
    bcrypt.compare(password, user.password, function (err, result) {
      console.log(result)
      if (result) {
        //use the payload to store information about the user such as username.
        let payload = { username: username, role: user.role };
        //create the access token 
        let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,{expiresIn: 300}); 
        res.cookie("jwt", accessToken);
        next();
      } else {
        return res.render("user/login"); //res.status(403).send();
      }
    });
  });
};

exports.verify = function (req, res, next) {
  let accessToken = req.cookies.jwt;
  if (!accessToken) {
    return res.status(403).send();
  }
  let payload;
  try {
    payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    next();
  } catch (e) {
    //if an error occured return request unauthorized error
    res.status(401).send();
  }
};

exports.verifyAdmin = function (req, res, next) 
{
  let accessToken = req.cookies.jwt;
  let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  if (payload.role != "admin") 
  {
    return res.status(403).send();
  }

  try 
  {
    next();
  } 
  catch (e) 
  {
    //if an error occured return request unauthorized error
    res.status(401).send();
  }
};

exports.verifypantry = function (req, res, next) 
{
  let accessToken = req.cookies.jwt;
  let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  if (payload.role != "pantry") 
  {
    return res.status(403).send();
  }

  try 
  {
    next();
  } 
  catch (e) 
  {
    //if an error occured return request unauthorized error
    res.status(401).send();
  }
};

