const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Populate = require("../utils/autopopulate");


const CommentSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  content: { type: String, required: true },
  author : { type: Schema.Types.ObjectId, ref: "User", required: true },
  comments: [{type: Schema.Types.ObjectId, ref: "Comment"}] 
});

// Always populate the author field
CommentSchema
    .pre('findOne', Populate('author'))
    .pre('find', Populate('author'))
    .pre('findOne', Populate('comments'))
    .pre('find', Populate('comments'))

CommentSchema.pre("save", function(next) {
  // SET createdAt AND updatedAt
  const now = new Date();
  this.updatedAt = now;

  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});


module.exports = mongoose.model("Comment", CommentSchema);