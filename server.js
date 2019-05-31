const express = require('express');
const port = 3000
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const app = express();

// Use Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Add after body parser initialization!
app.use(expressValidator());

// Set db
require('./data/reddit-db');


app.use('/static', express.static('public'))

app.set('view engine', 'pug');


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/posts/new', (req, res) => {
    res.render('posts-new')
})

app.listen(port, () => {
    console.log(`The application is running in port ${port}`)
});

require('./controllers/posts.js')(app);

