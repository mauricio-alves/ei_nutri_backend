const { Schema, model, Types } = require("mongoose");

const reviewSchema = new Schema({
  owner: { type: Types.ObjectId, ref: "User" },
  title: { type: String, trim: true, maxLength: 64 },
  rating: {
    type: String,
    enum: ["★☆☆☆☆", "★★☆☆☆", "★★★☆☆", "★★★★☆", "★★★★★"],
    default: "★★★",
  },
  description: { type: String, maxLength: 144 },
  creationDate: { type: Date, default: Date.now() },
  // reviews: [{ type: Types.ObjectId, ref: "Admin" }],
});

const ReviewModel = model("Review", reviewSchema);

module.exports = ReviewModel;
