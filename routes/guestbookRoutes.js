const express = require('express');
const router = express.Router();
const controller = require('../controllers/guestbookControllers.js');
const {login, verifyAdmin, verifypantry,verifyspecial} = require('../auth/auth')
const {verify} = require('../auth/auth');
const { get } = require('jquery');

router.get('/login', controller.show_login);
router.post('/login', login, controller.handle_login);
router.get("/",controller.landing_page);
router.get("/about", controller.aboutius);
router.post('/new', verify, controller.post_new_entry);
router.get('/posts/:author', controller.show_user_entries);
router.get('/register', controller.show_register_page);
router.post('/register', controller.post_new_user);
router.get("/loggedIn",verify, controller.loggedIn_landing);
router.get("/logout", controller.logout);
router.get("/donate",verify, controller.donate);
router.post("/donate",verify, controller.makeDonation);
router.get("/alldonations",verifyspecial , controller.alldonations);
router.post("/alldonations",verifyspecial , controller.deletedonation);

router.get("/contact",verify,controller.contact)
router.post("/contact",verify,controller.sendcontact)
router.get("/contacts",verify,controller.getallcontacts)
router.post("/contacts",verify,controller.deletecontact)



router.get("/claim/:_id", verifypantry, controller.viewdonation);
router.get("/claimed", verifypantry, controller.claimed);
router.get("/delete/:_id", verifypantry, controller.deletedonation);
router.get("/userControl", verifyAdmin, controller.userControl);
router.get("/unclaim/:_id", controller.unclaimDonation);


router.get("/createUsers",verifyAdmin,controller.createUsers);
router.post("/createUsers",verifyAdmin,controller.post_createUsers);

router.post("/deleteuser/", verifyAdmin, controller.deleteuser);
router.post("/deletdonation/", verifyAdmin, controller.deleteuser);




router.use(function(req, res) {
        res.status(404);
        res.type('text/plain');
        res.send('404 Not found.');
    });
// router.use(function(err, req, res, next) {
//         res.status(500);
//         res.type('text/plain');
//         res.send('Internal Server Error.');
//     });
module.exports = router;