var Post = require("../models/post").Posts;
var Comment = require("../models/comment");
var User = require("../models/user");

module.exports = app => {
  // NEW REPLY
  app.get("/posts/:postId/comments/:commentId/replies/new", (req, res) => {
    let post;
    var userImage;
    var currentUser = req.user;

    User.findById({_id: currentUser._id})
        .then(user => {
            if (user.file) {
                userImage = user.file.filename
            }
        })
        .catch(err => {
            console.log("Error: -> ", err.message);
        });
    Post.findById(req.params.postId)
      .then(p => {
        post = p;
        return Comment.findById(req.params.commentId);
      })
      .then(comment => {
        res.render("replies-new", { post, comment, userImage, currentUser });
      })
      .catch(err => {
        console.log(err.message);
      });
  });

  // CREATE REPLY
    app.post("/posts/:postId/comments/:commentId/replies", (req, res) => {
        console.log("Working fine")
        // TURN REPLY INTO A COMMENT OBJECT
        const reply = new Comment(req.body);
        reply.author = req.user._id
        // LOOKUP THE PARENT POST
        Post.findById(req.params.postId)
            .then(post => {
                // FIND THE CHILD COMMENT
                Promise.all([
                    reply.save(),
                    Comment.findById(req.params.commentId),
                ])
                    .then(([reply, comment]) => {
                        // ADD THE REPLY
                        comment.comments.unshift(reply._id);

                        return Promise.all([
                            comment.save(),
                        ]);
                    })
                    .then(() => {
                        res.redirect(`/posts/${req.params.postId}`);
                    })
                    .catch(console.error);
                // SAVE THE CHANGE TO THE PARENT DOCUMENT
                return post.save();
            })
    });
};