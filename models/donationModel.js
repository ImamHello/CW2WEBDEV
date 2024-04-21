const nedb = require('gray-nedb');
const donationDB = new nedb({ filename: './databases/donation.db', autoload: true });
const { resolve } = require('path');

class dontation {
    constructor(donation_type, pantry, exdate,additional,claimed) {
        this.donation_type = donation_type;
        this.pantry = pantry;
        this.exdate = exdate;
        this.additional = additional;
        this.claimed = claimed;
    }

    create(donation_type, pantry, exdate,additional,username,claimed, cb) {
            const entry = {
                donation_type: donation_type,
                pantry: pantry,
                exdate: exdate,
                additional: additional,
                username: username,
                claimed: claimed,
            };
            donationDB.insert(entry, function (err, entry) {
                if (err) {
                    console.log("Error creating dontation:", err);
                    return cb(err);
                }
                console.log("dontation created:", entry);
                return cb(null, entry);
            });
    }
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

        claimDonation(donationId, userid) {
    return new Promise((resolve, reject) => {
        donationDB.update({ _id: donationId }, { $set: { 'claimed': true, 'pantry': userid } }, {}, function (err, donations) {
            if (err) {
                console.log('error updating documents', err);
                reject(err);
            } else {
                console.log(donations, 'documents updated');
                resolve(donations);
            }
        });
    });
}

unclaimDonation(donationId) {
    return new Promise((resolve, reject) => {
        donationDB.update({ _id: donationId }, { $set: { 'claimed': false, 'pantry': '' } }, {}, function (err, donations) {
            if (err) {
                console.log('error updating documents', err);
                reject(err);
            } else {
                console.log(donations, 'documents updated');
                resolve(donations);
            }
        });
    });
}




removeDonation(donationId) {
    return new Promise((resolve, reject) => {
        donationDB.remove({_id: donationId}, function(err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}




expiredcheck() {
    return new Promise((resolve, reject) => {
        const curdate = new Date();
        console.log("Current date:", curdate);
        donationDB.find({}, function(err, donations) {
            if (err) {
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
                    console.error("Error removing expired donations:", err);
                    reject(err);
                } else {
                    console.log("Number of expired donations removed:", daterem);
                    resolve(daterem);
                }
            });
        });
    });
}


}
    module.exports = dontation;