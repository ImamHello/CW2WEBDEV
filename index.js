// setting up imports and paths
const express = require('express');
const express_handlebars = require('express-handlebars');
const app = express();
require('dotenv').config(); // loads data from .env file
const moment = require('moment');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
const path = require('path');
const public = path.join(__dirname, 'public');
app.use(express.static(public));


app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); 

// setting up handlebars as the template engine rather than useing mustashe and some fucntions helpers 
const handlebars = express_handlebars.create({
    partialsDir: path.join(__dirname, 'views/layouts'),
});

handlebars.handlebars.registerPartial('nav', '{{nav}}');


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// helper function for checking to see if 2 varables are the same 
handlebars.handlebars.registerHelper('if_eq', function(a, b, opts) {
    if(a == b)
        return opts.fn(this);
    else
        return opts.inverse(this);
});

// checking to see if two varables are not the same
handlebars.handlebars.registerHelper('if_not', function(a, opts) {
    if (!a) {
        return opts.fn(this);
    } else {
        return opts.inverse(this);
    }
});


// formats the data to day month year
handlebars.handlebars.registerHelper('formatTime', function (date, format) {
    var convert = moment(date);
    return convert.format(format);
});

// getting router setup in index 
const router = require('./routes/Routes');
app.use('/', router);


// listining for the env port for when the site is deployed or port 3000
app.listen(process.env.PORT || 3000, () => {
    console.log('Server started. Ctrl^c to quit.');
});
