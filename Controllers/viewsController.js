const { tryCatch } = require("../Utils/tryCatch");
const Chats = require("../Models/chatsModel");
const User = require("../Models/userModel");
const axios = require("axios");
exports.authUser = tryCatch((req, res) => {
  res.render("sign");
});
exports.logout = tryCatch((req, res) => {
  res.clearCookie("jwt");
  return res.redirect("/accounts");
});
exports.index = tryCatch((req, res) => {
  console.log("hit");
  res.render("index");
});

exports.chat = tryCatch(async (req, res) => {
  console.log("ur ", res.locals.user);
  const user = res.locals.user;
  if (!user) {
    return res.redirect("/accounts");
  }
  const chats = await Chats.find({ users: res.locals.user._id })
    .populate("users")
    .sort({ updatedAt: -1 });
  const requests = user.requests.length;
  console.log("chats ", chats[0]?.shared, chats[0]?._id);
  res.render("chat", { user, chats, requests });
});

exports.ConfirmSingup = tryCatch(async (req, res) => {
  const { token } = req.params;
  axios({
    method: "GET",
    url: `http://172.20.10.12:5000/api/v1/users/confirm/${token}`,
  })
    .then((result) => {
      console.log(result.data);
      res.render("confirm", { confRes: result.data });
    })
    .catch((err) => {
      console.log(err.response.data.message);
      res.render("confirm", {
        confRes: { message: `${err.response.data.message}` },
      });
    });
});
