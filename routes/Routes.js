// setting up inports for express the making sure that router works and that the controller brought
const express = require('express');
const router = express.Router();
const controller = require('../controllers/Controllers.js');
const {login, verifyAdmin, verifypantry,verifyspecial,verify} = require('../auth/auth.js')
// ensureing that the auth functiuons are able to be used to secure the site 
// login get and post 
router.get('/login', controller.show_login);
router.post('/login', login, controller.handle_login);

// getting the homepage
router.get("/",controller.landing_page);
// the about page routing
router.get("/about", controller.aboutius);
// register get and post
router.get('/register', controller.show_register_page);
router.post('/register', controller.post_new_user);
// logging in with verify and logging out 
router.get("/loggedIn",verify, controller.loggedIn_landing);
router.get("/logout", controller.logout);
// donation routs
router.get("/donate",verify, controller.donate);
router.post("/donate",verify, controller.makeDonation);
router.get("/alldonations",verifyspecial , controller.alldonations);
router.post("/alldonations",verifyspecial , controller.deletedonation);

//contact routs 
router.get("/contact",verify,controller.contact)
router.post("/contact",verify,controller.sendcontact)
router.get("/contacts",verifyAdmin,controller.getallcontacts)
router.post("/contacts",verifyAdmin,controller.deletecontact)


// routs for claiming unclaim and deleting of dontations
router.get("/claim/:_id", verifypantry, controller.viewdonation);
router.get("/claimed", verifypantry, controller.claimed);
router.get("/delete/:_id", verifypantry, controller.deletedonation);
// route to allow the admin to view all users and delete them
router.get("/userControl", verifyAdmin, controller.userControl);
router.get("/unclaim/:_id", controller.unclaimDonation);

// get and post for creation of users from admin 
router.get("/createUsers",verifyAdmin,controller.createUsers);
router.post("/createUsers",verifyAdmin,controller.post_createUsers);
// delete users from admin
router.post("/deleteuser/", verifyAdmin, controller.deleteuser);
router.post("/deletdonation/", verifyAdmin, controller.deleteuser);


// error routs for 404 and 500 status

router.use(function(req, res) {
        res.status(404);
        res.type('text/plain');
        res.send('404 Not found.');
    });
router.use(function(err, req, res, next) {
         res.status(500);
         res.type('text/plain');
         res.send('Internal Server Error.');
     });
module.exports = router;