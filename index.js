const express = require('express');
const express_handlebars = require('express-handlebars');
const app = express();
require('dotenv').config(); // loads data from .env file

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.urlencoded({
    extended: true
}));

const path = require('path');
const public = path.join(__dirname, 'public');
app.use(express.static(public));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); 

const handlebars = express_handlebars.create({
    partialsDir: path.join(__dirname, 'views/layouts')
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

const router = require('./routes/guestbookRoutes');
app.use('/', router);

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started. Ctrl^c to quit.');
});
