var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const schemaOptions = {
    versionkey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  };

var SessionSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.ObjectId, ref: "Author", required: true },
  summary: { type: String, required: true },
  genre: [{ type: Schema.ObjectId, ref: "Genre" }]
}, schemaOptions);

module.exports = mongoose.model("Session", SessionSchema);