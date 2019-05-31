const express = require('express');
const port = 3000
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const app = express();
const Posts = require('./models/post').Posts;

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



app.get('/', (req, res) => {
    Posts.find({}, function(err, posts) {
        console.log(posts)
        res.render('index', {posts: posts});
     });
});

app.get('/posts/new', (req, res) => {
    res.render('posts-new')
})

app.listen(port, () => {
    console.log(`The application is running in port ${port}`)
});

require('./controllers/posts.js')(app);

