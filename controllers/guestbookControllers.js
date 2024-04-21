const { title } = require("process");
const userDAO = require('../models/userModel.js');
const pantryDAO = require('../models/donationModel.js');
const contactDAO = require('../models/contactModel.js');

const { response } = require("express");
const { verify } = require("crypto");
const { verifyAdmin, verifypantry } = require("../auth/auth.js");
const user_db = new userDAO();
const donationDB = new pantryDAO();
const contact_db = new contactDAO();


const jwt = require("jsonwebtoken");


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
  try {
    if (accessToken) {
      let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      // Token is not expired, proceed with rendering entries
      if (payload.role) {
        res.render("entries", {
          title: "Scotish Pantry Network",
          token: payload.role,
          'nav': true, 
        });
        return; // Exit after rendering
      } 
    }
  } catch (err) {
    res.render("entries", {
      title: "Scotish Pantry Network",
      'nav': true, 
    });
  }

  // If no token or token verification failed, render the "entries" view with default settings
  res.render("entries", {
    title: "Scotish Pantry Network",
    'nav': true, // Removed quotes around 'nav'
  });
}


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



//pantry donations
exports.donate = function (req, res) {
  user_db.getPantrys()
    .then((list) => {
      res.render("user/donate", {
        title: "Donation",
        pantrys: list,
        'nav': true,
      });
    })
    .catch((err) => {
      res.redirect("login"); // Redirect on error
    });
};
//pantry donations

exports.makeDonation = function (req, res) {
    console.log('processing contact-new_entry controller');
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
//pantry view all donations 
exports.alldonations = function (req, res) {
  donationDB.expiredcheck()
  let accessToken = req.cookies.jwt;
  let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  console.log(payload.role)

  donationDB.alldonations()
    .then((list) => {
      res.render('donations/viewalldonations', {
        title: "All Donations",
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
  



//admin create users
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

//user control
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


exports.deleteuser = function (req, res) {
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
          console.log("register user", username,  role, "role");
          res.redirect("/");
      } else {
          res.status(409).send("User already exists");
      }
  });
};

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
      res.render("contact", {
        title: "Contact Us",
        'nav': true    
      }); 
    }
  } catch (error) {
    res.render("contact", {
      title: "Contact Us",
      'nav': true  
    }); 
  }
}

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


exports.getallcontacts = function (req, res) {
    contact_db.allcontacts()
    let accessToken = req.cookies.jwt;
    let payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  
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