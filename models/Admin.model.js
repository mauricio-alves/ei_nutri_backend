const { Schema, model, Types } = require("mongoose");

const adminSchema = new Schema({
  name: { type: String, required: true, trim: true, match: /\s/ },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  passwordHash: { type: String, required: true },
  img: { type: String },
  role: { type: String, enum: ["ADMIN", "USER"], default: "ADMIN" },
  isActive: { type: Boolean, default: true },
  disabledOn: { type: Date },
  address: { type: String, required: true, trim: true },
  patients: [{ type: Types.ObjectId, ref: "User" }],
  reviews: [{ type: Types.ObjectId, ref: "Review" }],
});

const AdminModel = model("Admin", adminSchema);

module.exports = AdminModel;
