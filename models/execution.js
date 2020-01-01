var mongoose = require("mongoose");
var moment = require("moment");

var Schema = mongoose.Schema;

var executionSchema = new Schema({
  session: { type: Schema.ObjectId, ref: "Session", required: true }, // Reference to the associated session.
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Running", "Passive", "Execution crushed", "exec crushed"],
    default: "Passive"
  },
  due_back: { type: Date, default: Date.now }
});

// Virtual for this execution object's URL.
executionSchema.virtual("url").get(function() {
  return "/exec/execution/" + this._id;
});

executionSchema.virtual("due_back_formatted").get(function() {
  return moment(this.due_back).format("MMMM Do, YYYY");
});

executionSchema.virtual("due_back_yyyy_mm_dd").get(function() {
  return moment(this.due_back).format("YYYY-MM-DD");
});

// Export model.
module.exports = mongoose.model("execution", executionSchema);
