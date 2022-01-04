// Imports
require('dotenv').config();
const http     = require('http');
const express  = require('express');

// Instantiate the server
const app = express();

// URL encoding
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Assets and styles requirements
app.use('/styles', express.static('./styles/'));
app.use('/images', express.static('/images/'));

// EJS
app.set('views', './views');
app.set('view engine', 'ejs');

app.get(/^\/$/, async (req, res) => {;
    res.render('index');
});

// Listen http
http.createServer(app).listen(80, () => {
    console.log('Server listening on port 80 !');
});