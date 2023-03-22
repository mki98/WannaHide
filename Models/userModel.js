const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username:{
    type:String,
    unique:[true,"This username is taken"],
    require:[true,"Please enter a username"]
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  photo:{
    type:String,
    default:'default.png'
  },
  friends:[{
    type: mongoose.Schema.ObjectId,
    ref: "Users",
  }],
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  createdAt:{
    type:Date,
    default: Date.now()
  }
},{strict:false});



UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
  
    this.password = await bcrypt.hash(this.password, 12);
    next();
});
UserSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();
  
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

UserSchema.pre(/^find/, function(next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});
UserSchema.methods.validatePassword = async function(hashedPassword, rawPassword){
    var valid = await bcrypt.compare(rawPassword,hashedPassword);
    console.log(valid)
    return valid
}
UserSchema.methods.changedPasswordAfterToken =  function(tokenIat){
  
    if (this.passwordChangedAt) {
      const lastChange =  parseInt(
        this.passwordChangedAt.getTime() / 1000,
        10
      );
      console.log(tokenIat < lastChange,lastChange)
      return tokenIat < lastChange;
    }

}
module.exports = mongoose.model("Users", UserSchema);
