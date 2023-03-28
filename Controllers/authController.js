const { tryCatch } = require("../Utils/tryCatch");
const AppError = require("../Utils/appError");
const Users = require("../Models/userModel.js");
const crypto = require("crypto");
const { sendMail } = require("../Utils/emailSender");
const jwt = require("jsonwebtoken");


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: `${process.env.JWT_EXPIRES_IN}d`,
  });
};

exports.checkToken = async (token) => {
  try {
    const valid = jwt.verify(token, process.env.JWT_SECRET);
    return valid;
  } catch (error) {
    console.log(error)
    return null
    }
};
const generateToken = () => {
  return crypto.randomBytes(20).toString("hex").slice(0, 15);
};
const sendVerfMail = async (...userdata) => {

  sendMail(
    userdata[0],
    "Confirm your signup",
    `Welcome ${userdata[1]} to complete your signup please click on the following link http://localhost:5000/confirm/${userdata[2]}`
  );
};
exports.protect = async (req, res, next) => {
  // Getting token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError(401, "Please login again"));
  }

  // 2) Verification token
  const info = await this.checkToken(token);

  if (!info) return next(new AppError(401, "Invalid token please login again"));
  // 3) Check if user still exists
  const currentUser = await Users.findById(info.id);
  if (!currentUser) {
    return next(
      new AppError(
        401,
        "The user belonging to this token does no longer exist."
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (await currentUser.changedPasswordAfterToken(info.iat)) {
    return next(
      new AppError(401, "User recently changed password! Please login again.")
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
};

exports.viewProtect = async (req, res, next) => {
  if (!req.cookies.jwt) {
    return next();
  }
  try {
    // 1) verify token
    const info = await this.checkToken(req.cookies.jwt);
    if (!info) {
      return next();
    }
    // 2) Check if user still exists
    const currentUser = await Users.findById(info.id);
    if (!currentUser) {
      return next();
    }
    // 3) Check if user changed password after the token was issued

    // if (await currentUser.changedPasswordAfter(info.iat)) {
    //   return next();
    // }

    // THERE IS A LOGGED IN USER
    res.locals.user = currentUser;
    next();
  } catch (err) {
    console.log(err, "view protect");
    next();
  }
};

exports.signup = tryCatch(async (req, res) => {
  const obj = ({ username, email, password, passwordConfirm } = req.body);
  if (!obj.email || !obj.username || !obj.password || !obj.passwordConfirm) {
    throw new AppError(400, "Please enter all required fields");
  }
  if(obj.password.length < 8)  throw new AppError(400, "Please enter minimum 8 characters password");

  if (obj.password != obj.passwordConfirm) {
    throw new AppError(400, "Password and Password Confirmation dosen't match");
  }
  if (
    (await Users.findOne({ username: obj.username })) ||
    (await Users.findOne({ email: obj.email }))
  ) {
    throw new AppError(400, "Username or Email is already taken");
  }
  Users.schema.add({ verified: Boolean, token: String });
  const token = generateToken();
  obj["verified"] = false;
  obj["token"] = token;
  delete obj.passwordConfirm;
  await sendVerfMail(obj.email, obj.username, token);
  console.log("Sending Mail...");
  const user = await Users.create(obj);
  res
    .status(201)
    .json({ status: "Success", message: "Email sent to confirm signup" ,user});
});

exports.confirmSignup = tryCatch(async (req, res) => {
  const token = req.params.token;
  const user = await Users.findOne({ token });
  if (!user) {
    throw new AppError(404, "This link is not valid anymore", "INVALID");
  }

  await Users.updateOne(
    { _id: user._id },
    { $unset: { verified: "", token: "" } }
  );
  return res.status(200).json({status:'Success',message:"Confirmation Successfull You Can Login "});
});

exports.login = tryCatch(async (req, res) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    throw new AppError(400, "Please provide email and password!");
  }
  // 2) Check if user exists && password is correct
  const user = await Users.findOne({ email:email }).select("+password");
  if (!user) {
    throw new AppError(401, "Incorrect Email");
  }
  if (!await user.validatePassword(user.password, password)) {
    throw new AppError(401, "Incorrect password");
  }
  const token = signToken(user._id);

  res.cookie("jwt", token, {
    httpOnly: true,
    expires: new Date(
      Date.now()+ process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
  });
  res
    .status(200)
    .json({ status: "Success", token, message: "Login Successful!" });
});

exports.logout = tryCatch((req, res) => {
  res.clearCookie("jwt");
  res.send("Loogedout");
});
