// sets up nedb and the path 
const nedb = require('gray-nedb');
const donationDB = new nedb({ filename: './databases/donation.db', autoload: true });
const { resolve } = require('path');

// creates a clas donation with donation type, pantry, experation date ,additional information and claimed
class dontation {
    constructor(donation_type, pantry, exdate,additional,claimed) {
        this.donation_type = donation_type;
        this.pantry = pantry;
        this.exdate = exdate;
        this.additional = additional;
        this.claimed = claimed;
    }

    // creates a donation based on the donation type, pantry, experation date ,additional infromation ,username ,if its claimed and a call back 
    create(donation_type, pantry, exdate,additional,username,claimed, cb) {
        // creates an entry varable from them 
            const entry = {
                donation_type: donation_type,
                pantry: pantry,
                exdate: exdate,
                additional: additional,
                username: username,
                claimed: claimed,
            };
            // tries to insert the entry varable with all sub varables 
            donationDB.insert(entry, function (err, entry) {
                // if there is an error it returns the call back with the error 
                if (err) {
                    console.log("Error creating dontation:", err);
                    return cb(err);
                }
                // if it suceseeds then it prints the varables it just created as a donation as well as retunriung the sucsesful entry 
                console.log("dontation created:", entry);
                return cb(null, entry);
            });
    }
    // gets all unclaimed donations returns error if its unable and returns the donations as well as a console log if it is able to
    alldonations(){
            return new Promise((resolve, reject) => 
            {
                donationDB.find({claimed: false}, function(err, donations)
                {
                    if(err)
                    {
                        reject(err);
                    }
                    else
                    {
                        console.log("Function returns: ", donations);
                        resolve(donations)

                    }
                });
            });
        }
    
        // gets all pantry dontaitons puts them into varable donations if it cant it returns error if it can it sucseeds  resolves the donations and prints it 
        allpantrydonations(pantry){
            return new Promise((resolve, reject) => 
            {
                donationDB.find({claimed: true, pantry:pantry}, function(err, donations)
                {
                    if(err)
                    {
                        reject(err);
                    }
                    else
                    {
                        console.log("Function returns: ", donations);
                        resolve(donations)

                    }
                });
            });
        }

        // claims a donatoin using donation id and user id of pantry claiming it 
        claimDonation(donationId, userid) {
            // creates new promise that can be rejected 
    return new Promise((resolve, reject) => {
        // updates the claimed and pantry finding it from the id passed in 
        donationDB.update({ _id: donationId }, { $set: { 'claimed': true, 'pantry': userid } }, {}, function (err, donations) {
            if (err) {
                // prints to console and rejects the error 
                console.log('error updating documents', err);
                reject(err);
            } else {
                // prints the donations that were updated and resolves it with thoes donatuions sucseeding 
                console.log(donations, 'documents updated');
                resolve(donations);
            }
        });
    });
}

// unclaimes a donation based on donation id 
unclaimDonation(donationId) {
    // new promis that can be rejected
    return new Promise((resolve, reject) => {
        // uses id to uptate the dontaion database for the claimed varable and pantry setting claimed to false and pantry to blanc 
        donationDB.update({ _id: donationId }, { $set: { 'claimed': false, 'pantry': '' } }, {}, function (err, donations) {
            if (err) {
                // if unsucessful returns error and printis error as well as rejecting the promise 
                console.log('error updating documents', err);
                reject(err);
            } else {
                // prints the donations that were updated 
                console.log(donations, 'documents updated');
                //resovees the dontaions and sends them back
                resolve(donations);
            }
        });
    });
}



// removes the dontation by dontation id
removeDonation(donationId) {
    // new promise that cna be rejected or resolved 
    return new Promise((resolve, reject) => {
        // removes the donation using the id 
        donationDB.remove({_id: donationId}, function(err, result) {
            if (err) {
                // if theres an error it recjects the promicse it send the error message 
                reject(err);
            } else {
                // if its sucessful it resolves the result of the donation being removed 
                resolve(result);
            }
        });
    });
}




expiredcheck() {
    // creates a promise that can be rejected 
    return new Promise((resolve, reject) => {
        // gets the current data and displays it 
        const curdate = new Date();
        console.log("Current date:", curdate);
        // goes through every dontaion 
        donationDB.find({}, function(err, donations) {
            if (err) {
                // of there is an error getting every donation it rejects the promis and passes the error to be returned 
                console.error("Error finding donations:", err);
                reject(err);
                return;
            }

            // filters all of the donations against the current data 
            const expiredDonations = donations.filter(donation => {
                const exdate = new Date(donation.exdate);
                return exdate < curdate;
            });

            // prints to terminal the expired donations 
            console.log("Expired donations:", expiredDonations);

            // Remove expired donations from the database through the expiredDonations id and prints how many dates were removed
            donationDB.remove({ _id: { $in: expiredDonations.map(d => d._id) } }, { multi: true }, function(err, daterem) {
                if (err) {
                    // if there is an error prints the error to the console and rehects the promice 
                    console.error("Error removing expired donations:", err);
                    reject(err);
                } else {
                    // resolves the data to remove and prints to console 
                    console.log("Number of expired donations removed:", daterem);
                    resolve(daterem);
                }
            });
        });
    });
}


}
// exports the dontation class
    module.exports = dontation;