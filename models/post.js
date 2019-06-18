const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Populate = require("../utils/autopopulate");

const PostSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  title: { type: String, required: true },
  url: { type: String, required: true },
  summary: { type: String, required: true },
  subreddit: { type: String },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment'}],
  author : { type: Schema.Types.ObjectId, ref: "User"},
  upVotes : [{ type: Schema.Types.ObjectId, ref: "User"}],
  downVotes : [{ type: Schema.Types.ObjectId, ref: "User"}],
  voteScore : {type: Number},
  file: {type: Object},
});

// Always populate the author field
PostSchema
    .pre('findOne', Populate('author'))
    .pre('find', Populate('author'))


PostSchema.pre("save", function(next) {
  // SET createdAt AND updatedAt
  const now = new Date();
  this.updatedAt = now;

  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});

var Posts = mongoose.model("Post", PostSchema)

module.exports.Posts = Posts ;
