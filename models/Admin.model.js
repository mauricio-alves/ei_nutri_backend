const { Schema, model, Types } = require("mongoose");

const adminSchema = new Schema({
  name: { type: String, required: true, trim: true },
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
  patients: [{ type: Types.ObjectId, ref: "User" }],
  diets: [{ type: Types.ObjectId, ref: "Admin" }],
});

const AdminModel = model("Admin", adminSchema);

module.exports = AdminModel;
