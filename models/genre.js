var mongoose = require("mongoose");
var GenreSchema = require('../schemas/genre');

/* var GenreSchema = new Schema({
  name: { type: String, required: true, min: 3, max: 100 }
}); */

// Virtual for this genre instance URL.
GenreSchema.virtual("url").get(function() {
  return "/exec/genre/" + this._id;
});

// Export model.
module.exports = mongoose.model("Genre", GenreSchema);
