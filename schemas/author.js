var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const schemaOptions = {
    versionkey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  };

var AuthorSchema = new Schema({
  uid: { type: String, required: true, max: 100 },
  date_of_birth: { type: Date, default: Date.now },
  date_of_death: { type: Date }
}, schemaOptions);

module.exports = mongoose.model("Author", AuthorSchema);