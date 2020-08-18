var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const schemaOptions = {
    versionkey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  };

var GenreSchema = new Schema({
  name: { type: String, required: true, min: 3, max: 100 }
}, schemaOptions);

module.exports = mongoose.model("Genre", GenreSchema);