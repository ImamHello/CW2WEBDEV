const nedb = require('gray-nedb');
const contactdb = new nedb({ filename: './databases/contact.db', autoload: true });
const { resolve } = require('path');


class Contact {
    constructor(author,details) {
        this.author = author;
        this.details = details;
    }

    createcontact(author, details, cb) {
        const entry = {
            author,
            details
        };
        contactdb.insert(entry, function (err, entry) {
            if (err) {
                console.log("Error creating contact form:", err);
                if (cb) cb(err); // Check if cb is defined before calling it
                return;
            }
            console.log("contact form created:", entry);
            if (cb) cb(null, entry); // Check if cb is defined before calling it
        });
    }
    

allcontacts(){
    return new Promise((resolve, reject) => 
    {
        contactdb.find({}, function(err, contacts)
        {
            if(err)
            {
                reject(err);
            }
            else
            {
                console.log("Function returns: ", contacts);
                resolve(contacts)

            }
        });
    });
}

deletecontact(id) {
    return new Promise((resolve, reject) => {
        contactdb.remove({_id: id}, function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}


}

module.exports = Contact;