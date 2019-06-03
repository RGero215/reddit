const Post = require('../models/post').Posts;
const User = require('../models/user');
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
        var userImage;
        var currentUser = req.user;
        if (req.user) {
            User.findById({_id: currentUser._id})
                .then(user => {
                    userImage = user.file.filename
                })
                .catch(err => {
                    console.log(err.message);
                });
        }
        
        Post.find({}).populate('author')
            .then(posts => {
                res.render("index", { posts, currentUser, userImage });
            })
            .catch(err => {
                console.log(err.message);
            });
    });
    
    app.get('/posts/new', (req, res) => {
        if (req.user) {
            var userImage;
            var currentUser = req.user;

            User.findById({_id: currentUser._id})
                .then(user => {
                    if (user.file){
                        userImage = user.file.filename
                        res.render('posts-new', {currentUser, userImage})
                    }
                    res.render('posts-new', {currentUser})
                })
                .catch(err => {
                    console.log(err.message);
                });
        } else {
            return res.status(401); // UNAUTHORIZED
        }
        
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
            post.author = req.user._id

            // SAVE INSTANCE OF POST MODEL TO DB
            post
                .save()
                .then(post => {
                    return User.findById(req.user._id);
                })
                .then(user => {
                    user.posts.unshift(post);
                    user.save();
                    // REDIRECT TO THE NEW POST
                    res.redirect(`/posts/${post._id}`);
                })
                .catch(err => {
                    console.log(err.message);
                });
        } else {
            return res.status(401); // UNAUTHORIZED
        }
        
    });

    app.get("/posts/:id", function(req, res, next) {
        // LOOK UP THE POST
        var userImage;
        var currentUser = req.user;

        User.findById({_id: currentUser._id})
            .then(user => {
                userImage = user.file.filename
                next(done)
            })
            .catch(err => {
                console.log(err.message);
            });
        Post.findById(req.params.id).populate({path:'comments', populate: {path: 'author'}}).populate('author')
            .then((post) => {
            res.render('posts-show', { post, currentUser, userImage })
          }).catch((err) => {
            console.log(err.message)
          })
    });

    // SUBREDDIT
    app.get("/n/:subreddit", function(req, res) {
        var userImage;
        var currentUser = req.user;

        User.findById({_id: currentUser._id})
            .then(user => {
                userImage = user.file.filename
            })
            .catch(err => {
                console.log(err.message);
            });
        Post.find({ subreddit: req.params.subreddit }).populate('author')
          .then(posts => {
            res.render("index", { posts, currentUser, userImage });
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
            if(file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
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