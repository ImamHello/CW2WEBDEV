const nedb = require('gray-nedb');
const userDB = new nedb({ filename: './databases/user.db', autoload: true });
const bcrypt = require('bcrypt');
const { resolve } = require('path');
const saltRounds = 12;

class User {
    constructor(username, email, password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }
    create(username, password, role, cb) {

        this.lookup(username, (err, existingUser) => {
            if (err) {
                console.log("Error checking existing user:", err);
                return cb(err);
            }
            if (existingUser) {
                console.log("User already exists:", username);
                return cb(null, existingUser); // Return existing user
            }

        bcrypt.hash(password, saltRounds).then(function(hash) {
            var entry = {
                username: username,
                password: hash,
                role: role,
            };
            userDB.insert(entry, function (err, newUser) {
                if (err) {
                    console.log("Error creating user:", err);
                    return cb(err);
                }
                console.log("User created:", newUser);
                return cb(null, newUser);
            });
        });
    });
    }
    lookup(username, cb) {
        userDB.find({'username': username}, function (err, entries) {
            if (err) {
                return cb(err, null);
            } else {
                if (entries.length == 0) {
                    return cb(null, null);
                } else {
                    return cb(null, entries[0]);
                }
            }
        });
    }

    // lookupusername(username, cb) {
    //     console.log(username)

    //     userDB.find({'username': username}, function (err, entries) {
    //         console.log(entries)
    //     if (err) {
    //         return cb(null, null);
    //     } else {
    //         if (entries.length == 0) {
    //             return cb(null, null);
    //         }
    //             return cb(null, entries[0]);
    //         }
    //     });
    // }

    loadAllUsers()
    {
        return new Promise((resolve, reject) => 
        {
            userDB.find({}, function(err, users)
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    resolve(users)
                    console.log("Function returns: ", users);
                }
            });
        });
    }
}


module.exports = User;