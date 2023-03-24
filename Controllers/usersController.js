const AppError = require("../Utils/appError");
const { tryCatch } = require("../Utils/tryCatch");
const Users = require("../Models/userModel");

exports.getMe = tryCatch(async (req, res) => {
  if (!req.user) throw new AppError(404, "This user is not found");
  return res.status(200).json({ status: "Success", User: req.user });
});

exports.getContacts = tryCatch(async (req, res) => {
  
  let contacts = await Users.findById(req.user._id).select(" friends -_id").populate('friends');
  return res.status(200).json({ status: "Success", contacts });
});

exports.addContact = tryCatch(async (req, res) => {
  const user = await Users.findOne({ username: req.user.username });  
  const friend = await Users.findOne({ username: req.body.friend });
  console.log(friend)
  if (!friend) {
    throw new AppError(404, "No user found");
  }
  console.log();
  if(user.friends.includes(friend._id)){
    throw new AppError(409,"Already a friend")
  }
  if(friend.requests.includes(user._id)){
    throw new AppError(409,"Friend request already sent")
  }
  friend.requests.push(user._id.toString());
  friend.save();
  res
    .status(200)
    .json({
      status: "Success",
      message: `A friend request is sent to ${friend.username}`,
    });
});

exports.getRequests = tryCatch(async (req, res) => {
  const user = await Users.findOne({ username: req.user.username }).populate(
    "requests"
  );
  return res.status(200).json({ status: "Success", requests: user.requests });
});

exports.confirmReq = tryCatch(async (req, res) => {
  const { respond, request } = req.body;
  if (!respond|| !request) return new AppError(400, "Invalid input");

  const user = await Users.findById(req.user._id);
  const reqUser = await Users.findById(request);

  console.log(reqUser);
  if (!reqUser) return new AppError(400, "No user with this info");

  if (respond == true) {
    user.friends.push(reqUser._id);
    reqUser.friends.push(user._id);
    reqUser.save();
  }
  user.requests.pull(reqUser._id)
  user.save();
  console.log(user.requests)

  res.status(200).json({ status: "Success", message: "Changes Saved" });
});
