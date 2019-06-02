const Post = require('../models/post').Posts;
const Comment = require('../models/comment');
const User = require('../models/user');

module.exports = function(app) {

    // GET Profile
    app.get('/profile', (req, res) => {
        if (req.user) {
            var userImage;
            var currentUser = req.user;

            User.findById({_id: currentUser._id}).populate('posts')
                .then(user => {
                    user = user
                    userImage = user.file.filename
                    res.render('profile', {currentUser, user, userImage})
                })
        } else {
            return res.status(401); // UNAUTHORIZED
        }
        
    })

};