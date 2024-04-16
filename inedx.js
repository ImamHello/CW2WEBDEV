const express = require('express');
const app = express();

require('dotenv').config() // loads data from .env file
const cookieParser = require('cookie-parser')
app.use(cookieParser())



app.use(express.urlencoded({ extended: true }));

const path = require('path');
const public = path.join(__dirname, 'public');
app.use(express.static(public));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));


const handlebars = require('handlebars');
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');