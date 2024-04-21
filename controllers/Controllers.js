// setting the modes to there dao first instances 
const userDAO = require('../models/userModel.js');
const pantryDAO = require('../models/donationModel.js');
const contactDAO = require('../models/contactModel.js');

// sets up required varables 
const { response } = require("express");
const { verify } = require("crypto");
const { verifyAdmin, verifypantry } = require("../auth/auth.js");
const user_db = new userDAO();
const donationDB = new pantryDAO();
const contact_db = new contactDAO();
// inituslses the databse as implementation of the user DAO alias

const jwt = require("jsonwebtoken");

// login page implmented from the login template with the title as login
exports.show_login = function (req, res) {
  res.render("user/login",{
    title: "login",
  });
};

// redirects to homepage after logging in 
exports.handle_login = function (req, res) {
  res.redirect("/")
};

// implements the landing page checks for the accessToken for logged in user navigation but it is implemented so all users even unlogged inusers or user with expired jwt tokens can acsess the homepage
// passes the title into the tempate 
exports.landing_page = function (req, res) {
  let accessToken = req.cookies.jwt;
  try {
    if (accessToken) {
      let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      // Token is not expired, proceed with rendering entries
      if (payload.role) {
        res.render("entries", {
          title: "Scottish Pantry Network",
          token: payload.role,
          'nav': true, 
        });
        return; // returns after rendering
      } 
    }
  } catch (err) {
    res.render("entries", {
      title: "Scottish Pantry Network",
      'nav': true, 
    });
  }

  // If no token or token verification failed, render the "entries" view with default settings
  res.render("entries", {
    title: "Scottish Pantry Network",
    'nav': true, // Removed quotes around 'nav'
  });
}


// renders the register page and passes in the title of register
exports.show_register_page = function (req, res) { 
  res.render("user/register",{
    title: "Register"
  });
}


// controller for posting a new user get usename and password from body
exports.post_new_user = function (req, res) {
  const username = req.body.username;
  const password = req.body.pass;
  // sets role to user
  const role = "user";
  // checks if there is a password if not sends an error code of 401 unautherorised requenst
  if (!username || !password) {
    res.send(401, "no user or no password");
    return;
  }
// sends 404 if it cant find the user 
    if (!req.body.username) {
      res.status(404).send("User not found");
      return;
    }

    // creates the user from the varabeles username password and role if there is a server error it send the status code 500
    user_db.create(username, password ,role, (err, newUser) => {
      if (err) {
          res.status(500).send("Error creating user");
          return;
      }
// if sucsesffuly rediurects user to login
      if (newUser) {
          res.redirect("/login");
      } else {
        // if suer already exitst sends error code with text User already exists
          res.status(409).send("User already exists");
      }
  });
};

// send user to loggin page with the title and template 
exports.loggedIn_landing = function (req, res) {
      res.render("entries", {
        title: "Login",
      });
};

// clears the vwt token and redirects back to the home page
exports.logout = function (req, res) {
  res.clearCookie("jwt").status(200).redirect("/");
};



// implments pantry donations
// uses the payload for the username for the create donation function if successful it adds the donation to the database if an error occurs it throws it to an internal server error 
// if successful it calls it gets a list of pantrys and passes it to the template donate with the user role for navigating and redirects the home apge if un sucsessful it redircts the user to the login page

exports.donate = function (req, res) {
  let accessToken = req.cookies.jwt;
 try{
  let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

  user_db.getPantrys()
    .then((list) => {
      res.render("user/donate", {
        title: "Donation",
        pantrys: list,
        token: payload.role,
        'nav': true,
      });
    })
    .catch((err) => {
      res.redirect("login"); // Redirect on error
    });
 }catch{
  res.redirect('/')
 }
  
};
//pantry donations
// sets a varable called claimed to false and uses the payload for the username for the create donation function if sucessful it addes the donation to the database if an error occurs it throws a interanl server error
// route if sucsessful it calls donationDB.expiredcheck() to check and delete if the newly created donation is expired and rediredcts the user to the home page  

exports.makeDonation = function (req, res) {
    let accessToken = req.cookies.jwt;
    let claimed = false;
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log(req.body.donation_type, req.body.pantry, req.body.Expiration_date,req.body.additional, payload.user.username);
    donationDB.create(req.body.donation_type, req.body.pantry, req.body.Expiration_date,req.body.additional,payload.user.username,claimed ,(err, newdonation)=> {
      if (err) {
        res.status(500).send("Error creating user");
        return;
    }
  else{
    donationDB.expiredcheck()
    res.redirect("/")
  }
});
}
//pantry view all donations checks for expired donatioins uses payload token for naviagtion if an error occurs returns 500 server error and prints the error
exports.alldonations = function (req, res) {
  donationDB.expiredcheck();
  let accessToken = req.cookies.jwt;
  let payload;
  try {
    payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log(payload.role);

    donationDB.alldonations()
      .then((list) => {
        res.render('donations/viewalldonations', {
          title: "All Donations",
          entries: list,
          token: payload.role,
          'nav': true,
        });
      })
      .catch((err) => {
        console.log("Error fetching donations:", err);
        res.status(500).send("Error fetching donations");
      });
  } catch (error) {
    console.log("Error verifying token:", error);
    res.status(401).send("Unauthorized");
  }
};


  // impliments view cheks to see if any of the donations from the doantion db are expired by calling expiredcheck uses acess token and payload to get the useranme claim dontaion passes in
  // both donationId,userid then if sucesssful prints Documents retrieved and the entires from the donation that were claimed if an error occurs then a 500 server error is called
exports.viewdonation = function (req, res) {
  try {
    donationDB.expiredcheck()

    const donationId = req.params._id; // Corrected variable name
    let accessToken = req.cookies.jwt;
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userid = payload.user.username;

    console.log(userid,donationId)
    donationDB.claimDonation(donationId,userid ) // Corrected function call
      .then(entries => {
        console.log("Documents retrieved:", entries);
        res.redirect("/claimed")
      })
      .catch(err => {
        console.error("Error claiming donation:", err);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error("Error fetching property data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// implemtns the delete donation which take in the doation id from the template body and uses that to call removeDonation by passing it the dontaion id it then if sucsessful prints and rediredcts the user
// to the all donations page if there is an error in the deletion then in interal server error is triggered 
exports.deletedonation = function (req, res) {
  try {
      const donationId = req.body._id;
      donationDB.removeDonation(donationId)
            .then(numRemoved => {
                console.log("Donation deleted successfully. Number of documents removed:", numRemoved);
                res.redirect("/alldonations");
            })
            .catch(err => {
                console.error("Error deleting donation:", err);
                res.status(500).json({ message: "Internal server error" });
            });
    } catch (error) {
        console.error("Error deleting donation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// implements claimed payload for naviagtion cheks for role on back end too passes in user id to allpantrydonations gets a list and sends it to the template viewpantrydonations if etherr is an error it send a 500
// error code 
exports.claimed = function (req, res) {
  let accessToken = req.cookies.jwt;
  let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  const userid = payload.user.username
  if(payload.role == 'pantry'){
    donationDB.allpantrydonations(userid,)
    .then((list) => {
      res.render('donations/viewpantrydonations', {
        title: "Pantry Donations",
        entries: list,
        token: payload.role,
        'nav': true,
      }); // Closing parenthesis was missing here
    })
    .catch((err) => {
      console.log("Error fetching donations:", err);
      res.status(500).send("Error fetching donations");
    });
  }

  }

  // implments the unclaim donation implements accessToken payload user id is gotten from the payload for the dontaion to be passed into unclaim donation
  exports.unclaimDonation = function (req, res) {
    let accessToken = req.cookies.jwt;
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    userid = payload._id
    const donationId = req.params._id; // Extracting donation ID from request parameters
    if(payload.role == 'pantry'){
      donationDB.unclaimDonation(donationId)
        res.redirect('/claimed')
    }
  }
  



//implments  admins create users
exports.createUsers = function (req, res) {
  // token and payload for navigation bar token based on a users role 
  let accessToken = req.cookies.jwt;
  let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
// renders page create user need to be loged in so payload dosn't have to be checked  
        res.render("user/createUser", {
          title: "Guest Book",
          user: "user",
          token: payload.role,
          'nav':true
        });
      
};

//user control implementation uses accessToken and payload for naviagtion bar loads users for display on the template if there is an error throws 500 server error fetching users or verifying the token 
exports.userControl = function (req, res) {
  try {
      let accessToken = req.cookies.jwt;
      let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      // Load users data asynchronously
      user_db.loadUsers()
          .then(users => {
              res.render("user/userContol", {
                  title: "Control users",
                  token: payload.role,
                  users: users,
                  'nav': true
              });
          })
          .catch(error => {
              console.error("Error fetching users:", error);
              res.status(500).json({ message: "Internal server error" });
          });
  } catch (error) {
      console.error("Error verifying access token:", error);
      res.status(500).json({ message: "Internal server error" });
  }
};

// implemetnts delete user gets user id from body and calls delete user if there is an error throws 500 and prints console error if sucessful print the userid of the deleted user and redirect to usercontrol
exports.deleteuser = function (req, res) {
  try{
    const userId = req.body.userId;
    user_db.deleteUser(userId, (err) => {
        if (err) {
            console.error("Error deleting user:", err);
            res.status(500).json({ message: "Internal server error" });
        } else {
            console.log("User deleted successfully:", userId);
        }
    });
    res.redirect("/userControl");
  }
  catch{
    res.redirect('login')
  }
  

};

// implements create users gets varables from template body checks if it got varables if it did create noew user if not 500 status or 409 already exists  
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
// if new user if false then it sends a 409 error if its true to redirects to homepage and logs the registered user 
      if (!newUser) {
          console.log("register user", username,  role, "role");
          res.redirect("/");
      } else {
          res.status(409).send("User already exists");
      }
  });
};

// implements the about us page uses accessToken and payload for the navigation bar renders the page also renders the page if there is no token as anyone can acess the about us page 

exports.aboutius = function (req, res) {
  let accessToken = req.cookies.jwt;

  try {
    if (accessToken) {
      let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      res.render("aboutus", {
        title: "About Us",
        token: payload.role,
        'nav': true
      });
    } else {
      // Handle case when there's no access token
      res.render("aboutus", {
        title: "About Us",
        'nav': true    
      }); 
    }
  } catch (error) {
    res.render("aboutus", {
      title: "About Us",
      'nav': true  
    }); 
  }
}

// implemets contact usess the acesss token to implemnt the navigation bar for when on the conatict page if it cant it 
exports.contact = function (req, res) {
  let accessToken = req.cookies.jwt;

  try {
    if (accessToken) {
      let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      res.render("contact", {
        title: "Contact Us",
        token: payload.role,
        'nav': true
      });
    } else {
      // Handle case when there's no access token
      res.redirect("/login")
    }
  } catch (error) {
    res.redirect("/login") // again in the event of another error it promits a login 

  }
}


// sends implments contact checks accesstoken if there is one it decodes the payload for the logged in  user so it can use that as the useranme for the contact message gets help from 
// text box in the template which takes in the user input on a submit if theres an error it thows interal server error  or throws to login if the token has expoired  
exports.sendcontact = function (req, res) {
  let accessToken = req.cookies.jwt;
  try {
    if (accessToken) {
      let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

      const help = req.body.help; 
      console.log(help);
      contact_db.createcontact(payload.user.username, help, (err, contact) => {
        if (err) {
          console.error("Error creating contact:", err);
          res.status(500).json({ message: "Internal server error" });
        } else {
          console.log("Contact form created:", contact);
          res.redirect('/'); 
        }
      });
    } else {
      // Handle case when there's no access token
      res.render("contact", {
        title: "Contact Us",
        token: payload.role,
        'nav': true    
      }); 
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("JWT token expired");
      // Handle token expiration here, e.g., redirect to login page
      res.redirect('/login');
    } else {
      res.redirect('/login');
    } 
  }
}

// implemetns get all contacts from the contacts database uses the allconatacts fucntion uses accessToken and payload to pass in the role for the navigation bar 
exports.getallcontacts = function (req, res) {
    contact_db.allcontacts()
    let accessToken = req.cookies.jwt;
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  // gets all contacts then puts them into a list to be displayed into the template with the navigaion token and setting the naviation to true if there are errors it thorws it to a interal server error 
    contact_db.allcontacts()
      .then((list) => {
        res.render('user/contacts', {
          title: "All Contacts",
          entries: list,
          token: payload.role,
          'nav': true,
        }); // Closing parenthesis was missing here
      })
      .catch((err) => {
        console.log("Error fetching donations:", err);
        res.status(500).send("Error fetching donations");
      });
    }

// implements the delete contact takes id from body uses delete conatct method passing in id then redirencts to contacts page if there are errors writes errors and send a 500 interanl server error 
    exports.deletecontact = function (req, res) {
      try {
          const contactId = req.body._id;
          contact_db.deletecontact(contactId)
                .then(contactrem => {
                    console.log("Donation deleted successfully. Number of documents removed:", contactrem);
                    res.redirect("/contacts");
                })
                .catch(err => {
                    console.error("Error deleting donation:", err);
                    res.status(500).json({ message: "Internal server error" });
                });
        } catch (error) {
            console.error("Error deleting donation:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    };
