const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const AdminSchema = mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Please Add A Name"],
  },

  username: {
    type: String,
    required: [true, "Please input a username"],
    unique: true,
    trim: true
  },

  role: {
    type: String,
    required: true,
    enum: ['super', 'director', 'staff']
  },

  email: {
    type: String,
    required: [true, "please add an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please enter a valid email"]
  },

  phoneNo: {
    type: String,
    required: [true, "please add a phone number"],
  },

  password: {
    type: String,
    required: [true, "Please enter a password"],
    minLength: [6, "Password must be up to 6 characters"],
  },

  package: {
    type: String,
    ref: "Package",
    default: "Executive"
  },

  walletBalance: {
    type: Number,
    default: 1000000
  },

  pv: {
    type: Number,
    default: 1000000
  },


}, {
  timestamps: true
});

// Encrypt the password before saving it
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }
  //hash user password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;
  next();
})

//convert all usernames to lower case
AdminSchema.pre('save', function (next) {
  if (this.isModified('username')) {
    this.username = this.username.toLowerCase();
  }
  next();
});

const Admin = mongoose.model("Admin", AdminSchema);
module.exports = Admin;