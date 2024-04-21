// setting up the nedb database and its pathing and the authinticaion requirements
const nedb = require('gray-nedb');
const userDB = new nedb({ filename: './databases/user.db', autoload: true });
const bcrypt = require('bcrypt');
const { resolve } = require('path');
const saltRounds = 12;

// creates user class with username email password and role as its only varables it later creates _id when initulising the database users
class User {
    constructor(username, email, password,role) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.role = role;
    }
    // creates a user from a username password and role using a callabck function
    create(username, password, role, cb) {
        // looks to see if the username exists  
        this.lookup(username, (err, existingUser) => {
            if (err) {
                console.log("Error checking existing user:", err);
                // call back error if it cant check if the user already exists
                return cb(err);
            }
            if (existingUser) {
                // call back error and console log if it already exists
                console.log("User already exists:", username);
                return cb(null, existingUser); // Return existing user
            }

            // if sucsessufl it encrypts the pasword adds salt before hashing it it does this 12 rounds 
        bcrypt.hash(password, saltRounds).then(function(hash) {
            var entry = {
                username: username,
                password: hash,
                role: role,
            };
            // inserts user into database
            userDB.insert(entry, function (err, newUser) {
                if (err) {
                    // if there is an error print to console and return the errror
                    console.log("Error creating user:", err);
                    return cb(err);
                }
                // if sucessful print to the console and return the new user in the callback 
                console.log("User created:", newUser);
                return cb(null, newUser);
            });
        });
    });
    }

    // looks up a username and returns the user in the varaible entires
    lookup(username, cb) {
        // find username within userdb
        userDB.find({'username': username}, function (err, entries) {
            if (err) {
                return cb(err, null);
            } else {
                // checking to see if the varable entires has any values if not return null in the call back 
                if (entries.length == 0) {
                    return cb(null, null);
                } else {
                    // return entires with[0] which will be the username
                    return cb(null, entries[0]);
                }
            }
        });
    }


    // loads every user 
    loadAllUsers()
    {
        // promise can be rejected or resolved
        return new Promise((resolve, reject) => 
        {
            // finds all users from user db 
            userDB.find({}, function(err, users)
            {
                if(err)
                {
                    // if error reject and pass in errors
                    reject(err);
                }
                else
                {
                    // if sucesfull pass out users and print to console 
                    resolve(users)
                    console.log("Function returns: ", users);
                }
            });
        });
    }

    // loads all users or pantrys
    loadUsers()
    {
        // creates a new promise that can be resolved or rejected 
        return new Promise((resolve, reject) => 
        {
            // finds users or pantrys and stores it in the varable users
            userDB.find({ role: { $in: ["user", "pantry"] } }, function(err, users) {            
                if(err)
                {
                    // if it encounters an error it rejects it and passes in the error 
                    reject(err);
                }
                else
                {
                    // if sucsessful it send users and outpusts to terminal 
                    resolve(users)
                    console.log("Function returns: ", users);
                }
            });
        });
    }

// deletes user using user id 
    deleteUser(id) {
            //return a Promise object, which can be resolved or rejected

        return new Promise((resolve, reject) => {
            // uses id to remove the user 
            userDB.remove({_id: id}, function(err, result) {
                if (err) {
                    // rejects the promice 
                    reject(err);
                } else {
                    // resolves the promise and returns the result from removing it 
                    resolve(result);
                }
            });
        });
    }
    

// get all pantrys 
getPantrys() 
{
    //return a Promise object, which can be resolved or rejected
    return new Promise((resolve, reject) => {
    //find all pantrys from the userDB
    userDB.find({ role: 'pantry' }, function(err, entries) {
    //if error occurs reject Promise
    if (err) {
    reject(err);
    //if no error resolve the promise and return data
    } else {
    resolve(entries);
    }
    })
    })
    }
}

// exporting the user so it can be used in the controllers 
module.exports = User;