const { Schema, model, Types } = require("mongoose");
// "\d{5}[\-]?\d{3}"
const adminSchema = new Schema({
  name: { type: String, required: true, trim: true, match: /\s/ },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  phone: { type: Number, required: true },
  crn: { type: Number, required: true, minLength: 4 },
  passwordHash: { type: String, required: true },
  img: { type: String },
  role: { type: String, enum: ["ADMIN", "USER"], default: "ADMIN" },
  appointments: [{ type: String }],
  isActive: { type: Boolean, default: true },
  disabledOn: { type: Date },
  patients: [{ type: Types.ObjectId, ref: "User" }],
  reviews: [{ type: Types.ObjectId, ref: "Review" }],
  address: new Schema({
    zipCode: { type: Number, maxLength: 9, required: true },
    street: { type: String, required: true, trim: true, maxLength: 64 },
    number: { type: Number, maxLength: 6, required: true },
    neighborhood: { type: String, maxLength: 144 },
    city: { type: String, maxLength: 144 },
    uf: { type: String, maxLength: 144 },
  }),
});

const AdminModel = model("Admin", adminSchema);

module.exports = AdminModel;
