require('dotenv').config()
const express = require('express');
const port = 3000
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
var cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const app = express();
app.use(cookieParser()); // Add this after you initialize express.

// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add after body parser initialization!
app.use(expressValidator());

// Set db
require('./data/reddit-db');

var checkAuth = (req, res, next) => {
    console.log("Checking authentication");
    if (typeof req.cookies.nToken === "undefined" || req.cookies.nToken === null) {
      req.user = null;
    } else {
      var token = req.cookies.nToken;
      var decodedToken = jwt.decode(token, { complete: true }) || {};
      req.user = decodedToken.payload;
    }
  
    next();
};
app.use(checkAuth);

app.locals.moment = require('moment');


app.use('/static', express.static('public'))

app.set('view engine', 'pug');

app.listen(port, () => {
    console.log(`The application is running in port ${port}`)
});

require('./controllers/posts.js')(app);
require('./controllers/comments.js')(app);
require('./controllers/auth.js')(app);
require('./controllers/profile.js')(app);
module.exports = app;

