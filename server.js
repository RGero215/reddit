const express = require('express');
const port = 3000
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const app = express();

var Grid = require('gridfs-stream');

// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add after body parser initialization!
app.use(expressValidator());

// Set db
require('./data/reddit-db');

app.locals.moment = require('moment');


app.use('/static', express.static('public'))

app.set('view engine', 'pug');

app.listen(port, () => {
    console.log(`The application is running in port ${port}`)
});

require('./controllers/posts.js')(app);
module.exports = app;

