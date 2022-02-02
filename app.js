// Imports
require('dotenv').config();
const http          = require('http');
const express       = require('express');
const session       = require('express-session');
const mongoose      = require('mongoose');
const passport      = require('passport');

const flash         = require('connect-flash');
const cookieParser  = require('cookie-parser');
const bodyParser    = require('body-parser');

// Instantiate the server
const app = express();
require('./config/passport')(passport);

// Database
mongoose.connect(process.env.MONGO_PASS, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Middleware
app.use(express.static(__dirname + '//images'));
app.use(express.static(__dirname + '//public'));

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// Passport.js
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
require('./app/routes.js')(app, passport);

// Listen http
http.createServer(app).listen(8080, () => {
    console.log('Server listening on port 8080 !');
});