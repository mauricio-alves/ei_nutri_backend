const { Schema, model, Types } = require("mongoose");

const userSchema = new Schema({
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
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  isActive: { type: Boolean, default: true },
  disabledOn: { type: Date },
  age: { type: Number, required: true, trim: true },
  weight: { type: Number, required: true, trim: true },
  height: { type: Number, required: true, trim: true },
  whyAreYouHere: {
    type: String,
    enum: [
      "Saúde",
      "Controle de peso",
      "Alergia alimentar",
      "Problemas digestivos e/ou intestinais",
      "Exame laboratorial alterado",
      "Outro",
    ],
    default: "Saúde",
    required: true,
  },
  nutritionist: { type: Types.ObjectId, ref: "Admin" },
  review: { type: Types.ObjectId, ref: "Review" },
});

const UserModel = model("User", userSchema);

module.exports = UserModel;
