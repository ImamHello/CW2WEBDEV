// setting up path for database
const nedb = require('gray-nedb');
const contactdb = new nedb({ filename: './databases/contact.db', autoload: true });
const { resolve } = require('path');


// creating class called contact with 2 varables and the id that will be auto generated author and the details of the contact message 
class Contact {
    constructor(author,details) {
        this.author = author;
        this.details = details;
    }

    // creates a contact from an author details and a call back 
    createcontact(author, details, cb) {
        // creats entry containing author and details
        const entry = {
            author,
            details
        };
        // inserts entry into contact db if it cant it returns an error and the callback with it and prints the error 
        contactdb.insert(entry, function (err, entry) {
            if (err) {
                console.log("Error creating contact form:", err);
                if (cb) cb(err); // Checks to see if the  cb is defined before calling it as it caused issues 
                return;
            }
            // if sucseffuly it prints contact created and the contact entry 
            console.log("contact form created:", entry);
            if (cb) cb(null, entry); // Checks to see if the  cb is defined before calling it as it caused issues 
        });
    }
    

    // returns all contacts from the contact database 
allcontacts(){
    return new Promise((resolve, reject) => 
    {
        contactdb.find({}, function(err, contacts)
        {
            // if there is an erorr it rejects the promise passing in the errror
            if(err)
            {
                reject(err);
            }
            else
            {
                // if sucsefful it resolves the contacts and retunrs the contats 
                console.log("return ", contacts);
                resolve(contacts)

            }
        });
    });
}

// deletes from id
deletecontact(id) {
    return new Promise((resolve, reject) => {
        // removes the entry by id 
        contactdb.remove({_id: id}, function(err, result) {
            if (err) {
                // if error rejects it passing in error 
                reject(err);
            } else {
                // reolves it passing the result of it 
                resolve(result);
            }
        });
    });
}


}
// exports the contact to be used in the controller 
module.exports = Contact;