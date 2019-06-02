const Post = require('../models/post').Posts;
var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
var Grid = require('gridfs-stream');
var mid = require('../middleware');

var mongoURI = 'mongodb://localhost/reddit-db'
let gfs;

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true });

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

module.exports = app => {

    app.get('/', (req, res) => {
        var currentUser = req.user;
        Post.find({})
            .then(posts => {
                res.render("index", { posts, currentUser });
            })
            .catch(err => {
                console.log(err.message);
            });
    });
    
    app.get('/posts/new', (req, res) => {
        res.render('posts-new')
    })
    
    // CREATE
    app.post("/posts/new", mid.upload.single('file'), (req, res, next) => {

        if (req.user) {
            // INSTANTIATE INSTANCE OF POST MODEL
            const post = new Post();
            post.title = req.body.title
            post.url = req.body.url
            post.summary = req.body.summary
            post.subreddit = req.body.subreddit
            post.file = req.file
            console.log("req.body.subreddit: ", req.body.subreddit)

            // SAVE INSTANCE OF POST MODEL TO DB
            post.save((err, post) => {
                // REDIRECT TO THE ROOT
                return res.redirect(`/`);
            })
        } else {
            return res.status(401); // UNAUTHORIZED
        }
        
    });

    app.get("/posts/:id", function(req, res) {
        // LOOK UP THE POST
        Post.findById(req.params.id).populate('comments').then((post) => {
            res.render('posts-show', { post })
          }).catch((err) => {
            console.log(err.message)
          })
    });

    // SUBREDDIT
    app.get("/n/:subreddit", function(req, res) {
        Post.find({ subreddit: req.params.subreddit })
          .then(posts => {
            res.render("index", { posts });
          })
          .catch(err => {
            console.log(err);
          });
    });

    app.get('/files', (req, res) => {
        gfs.files.find().toArray((err, files) => {
            // check if files
            if(!files || files.length === 0) {
                return res.status(404).json({
                    err: 'No Files Exist'
                });
            }
            // Files exist
            return res.json(files);
        })
    })

    app.get('/files/:filename', (req, res) => {
        gfs.files.findOne({filename: req.params.filename}, (err, file) => {
            // check if file
            if(!file || file.length === 0) {
                return res.status(404).json({
                    err: 'No File Exist'
                });
            }
            // file exists
            return res.json(file)
        });
       
    })

    app.get('/image/:filename', (req, res) => {
        gfs.files.findOne({filename: req.params.filename}, (err, file) => {
            // check if file
            if(!file || file.length === 0) {
                return res.status(404).json({
                    err: 'No File Exist'
                });
            }
            // check if image
            if(file.contentType === 'image/jpeg' || file.contentType === 'img/png') {
                // Read 
                const readstream = gfs.createReadStream(file.filename);
                readstream.pipe(res);
            } else {
                res.status(404).json({
                    err: 'Not an image'
                })
            }
        });
       
    })
};