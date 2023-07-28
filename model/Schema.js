const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    // unique:true,
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  qualifications: [
    {
    type: String,
    required: true,}
  ],
  classes: [
    {
    type: String,
    required: true,}
  ],
  // to: {
  //   type: String,
  //   // required: true,
  // },  
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  students: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
    }
  ],
  testimonials: [{
    email: { type: String, required: true },
    test: { type: String, required: true },
  }],
 
});


userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});


// we are generating token
userSchema.methods.generateAuthToken = async function () {
  try {
    // console.log(process.env.REACT_APP_TOKEN," hihiihii");
    let token = jwt.sign(
      { _id: this._id },
      process.env.REACT_APP_TOKEN
    );
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};

const User = mongoose.model("Tutor", userSchema); //class bni h
module.exports = User;
