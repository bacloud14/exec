var mongoose = require("mongoose");
var SessionSchema = require('../schemas/session');

/* var SessionSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.ObjectId, ref: "Author", required: true },
  summary: { type: String, required: true },
  genre: [{ type: Schema.ObjectId, ref: "Genre" }]
}); */

// Virtual for this session instance URL.
SessionSchema.virtual("url").get(function() {
  return "/exec/session/" + this._id;
});

// Export model.
module.exports = mongoose.model("Session", SessionSchema);
