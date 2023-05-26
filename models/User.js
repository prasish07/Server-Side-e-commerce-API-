const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!!"],
    trim: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please enter your email!!"],
    trim: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: "Please enter a valid email!!",
    },
  },
  password: {
    type: String,
    required: [true, "Please enter your password!!"],
    trim: true,
    minlength: [6, "Password must be at least 6 characters!!"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  image: {
    type: String,
    default:
      "https://thumbs.dreamstime.com/b/no-image-available-icon-flat-vector-no-image-available-icon-flat-vector-illustration-132482953.jpg",
  },
  aboutme: String,
});

userSchema.pre("save", async function () {
  console.log(this.modifiedPaths());
  console.log(this.isModified("password"));
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidate_password) {
  const isMatch = await bcrypt.compare(candidate_password, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", userSchema);
