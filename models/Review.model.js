const { Schema, model, Types } = require("mongoose");

const reviewSchema = new Schema({
  owner: { type: Types.ObjectId, ref: "User" },
  title: { type: String, required: true, trim: true, maxLength: 64 },
  // nota de avaliação 1 a 5 estrelas ?
  description: { type: String, maxLength: 144 },
  creationDate: { type: Date, default: Date.now() },
  reviews: [{ type: Types.ObjectId, ref: "Admin" }],
});

const ReviewModel = model("Review", reviewSchema);

module.exports = ReviewModel;