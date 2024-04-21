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
      res.redirect("/")

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
        let payload = { user: user, role: user.role };
        //create the access token 
        let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,{expiresIn: 300}); 
        res.cookie("jwt", accessToken);
        next();
      } else {
        return res.redirect('/register');

      }
    });
  });
};

exports.verify = function (req, res, next) 
{
  let accessToken = req.cookies.jwt;
  try {
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (payload.role !== "user" && payload.role !== "admin") {
      return res.status(403).send();
    }
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired');
      return res.redirect("/login"); // Redirect to login page if token is expired
    }
    console.error('Token verification failed:', error);
    res.status(401).send(); // Unauthorized due to token verification failure
  }
};

exports.verifyAdmin = function (req, res, next) 
{
  try{

  
  let accessToken = req.cookies.jwt;
  try {
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (payload.role !== "admin") {
      return res.redirect('/register');

    }
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired');
      return res.redirect("/login"); // Redirect to login page if token is expired
    }
    console.error('Token verification failed:', error);
    return res.redirect("/login"); // Redirect to login page if token is expired
  }
}catch{
  return res.redirect("/login")

}

};

exports.verifypantry = function (req, res, next) 
{
  let accessToken = req.cookies.jwt;
  try {
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (payload.role !== "pantry") {
      return res.status(403).send();
    }
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired');
      return res.redirect("/login"); // Redirect to login page if token is expired
    }
    console.error('Token verification failed:', error);
    res.status(401).send(); // Unauthorized due to token verification failure
  }
};


exports.verifyspecial = function (req, res, next) 
{
  let accessToken = req.cookies.jwt;
  try {
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (payload.role !== "pantry" && payload.role !== "admin") {
      return res.status(403).send();
    }
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired');
      return res.redirect("/login"); // Redirect to login page if token is expired
    }
    console.error('Token verification failed:', error);
    res.status(401).send(); // Unauthorized due to token verification failure
  }
};
