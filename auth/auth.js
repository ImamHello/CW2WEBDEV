const bcrypt = require("bcrypt");
const userDAO = require('../models/userModel.js');
const jwt = require("jsonwebtoken");
const user_db = new userDAO();


// implements the login using the username and password from the body 
exports.login = function (req, res,next) {
  let username = req.body.username;
  let password = req.body.password;


  // checks to see if a user with the useranme exists 
  user_db.lookup(username, function (err, user) {
    if (err) {
      console.log("error looking up user", err);
      res.redirect("/")
// if an iusse occurs sends a satus code of 401 Unauthorized and redirects to homepage
      return res.status(401).send();
    }
    // if the user isn't found redirects to registration apge 
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
        // creates the cookie that stores the encrypted token
        res.cookie("jwt", accessToken);
        next();
      } else {
        // returns the register page if an issue occurs 
        return res.redirect('/register');

      }
    });
  });
};

// verification for users creates the token decrypts the payload cookie for the user roke if user or admin allows accesss send error messages if it does not occur 
exports.verify = function (req, res, next) 
{
  let accessToken = req.cookies.jwt;
  try {
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (payload.role !== "user" && payload.role !== "admin") {
      return res.status(403).send();
    }
    // returns to next chain in the route
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


// verifys the admin role using the decrypted cookie and checking the role against the payload if it dosn't match it redirects to register 
exports.verifyAdmin = function (req, res, next) 
{
  try{

  
  let accessToken = req.cookies.jwt;
  try {
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (payload.role !== "admin") {
      return res.redirect('/register');

    }
    // returns to next chain in the route
    next();
    
    // more error checking returns login for each error as well as the consoele 
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

// verification for the pantry role 
exports.verifypantry = function (req, res, next) 
{
  // gets the token
  let accessToken = req.cookies.jwt;
  try {
    // decrypts the jwt token for the role to check if it is pantry
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (payload.role !== "pantry") {
      // if not it sends the status code forbidden
      return res.status(403).send();
    }
    // returns to the next chain in the route 
    next();
    // if an error ocurs send user to login with error message to console 
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired');
      return res.redirect("/login"); // Redirect to login page if token is expired
    }
    console.error('Token verification failed:', error);
    res.status(401).send(); // Unauthorized due to token verification failure
    return res.redirect("/login"); // Redirect to login page if token is expired

  }
};

// verification for pantry and admin 
exports.verifyspecial = function (req, res, next) 
{
  // gets token
  let accessToken = req.cookies.jwt;
  try {
    // decrypts the payload from the jwt token 
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    // checks the role if it is not pantry and admin 
    if (payload.role !== "pantry" && payload.role !== "admin") {
      // returns forbiden status code
      return res.status(403).send();
    }
    // if it is pantry or admin it returns to the next chain in the route it was called in 
    next();
    // redirects the user to login if an issue occurs 
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error('JWT token expired');
      return res.redirect("/login"); // Redirect to login page if token is expired
    }
    console.error('Token verification failed:', error);
    res.status(401).send(); // Unauthorized due to token verification failure
    return res.redirect("/login"); // Redirect to login page if token is a verification failure

  }
};
