var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const schemaOptions = {
    versionkey: false,
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  };

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
  }, schemaOptions);

  module.exports = mongoose.model("execution", executionSchema);