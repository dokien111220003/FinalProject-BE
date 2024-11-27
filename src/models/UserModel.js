const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: [true, "email already taken"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password length should be greadter then 6 character"],
    },
    isAdmin: { type: Boolean, default: false, required: true },
    isProductManage: { type: Boolean, default: false },
    isOrderManage: { type: Boolean, default: false },
    phone: { type: Number },
    address: { type: String },
    // googleId: { type: String, unique: true },
    avatar: { type: String },
    city: { type: String },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
