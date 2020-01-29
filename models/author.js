var mongoose = require("mongoose");
var moment = require("moment"); // For date handling.

var AuthorSchema = require('../schemas/author');

/* var AuthorSchema = new Schema({
  uid: { type: String, required: true, max: 100 },
  date_of_birth: { type: Date, default: Date.now },
  date_of_death: { type: Date }
}); */

// Virtual for author "full" name.
AuthorSchema.virtual("name").get(function() {
  var fullname = '';
  if (this.uid) {
    fullname = this.uid;
  }
  return fullname;
});

// Virtual for this author instance URL.
AuthorSchema.virtual("url").get(function() {
  return "/exec/author/" + this._id;
});

AuthorSchema.virtual("lifespan").get(function() {
  var lifetime_string = "";
  if (this.date_of_birth) {
    lifetime_string = moment(this.date_of_birth).format("MMMM Do, YYYY");
  }
  lifetime_string += " - ";
  if (this.date_of_death) {
    lifetime_string += moment(this.date_of_death).format("MMMM Do, YYYY");
  }
  return lifetime_string;
});

AuthorSchema.virtual("date_of_birth_yyyy_mm_dd").get(function() {
  return moment(this.date_of_birth).format("YYYY-MM-DD");
});

AuthorSchema.virtual("date_of_death_yyyy_mm_dd").get(function() {
  return moment(this.date_of_death).format("YYYY-MM-DD");
});

// Export model.
module.exports = mongoose.model("Author", AuthorSchema);