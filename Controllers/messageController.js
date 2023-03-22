const Messages = require("../Models/messageModel");
const Chats = require("../Models/chatsModel");

exports.sendMessage = async (req, res) => {
  const { _id } = req.user;
  const { content, chat } = req.body;
  const newMsg = await Messages.create({ sender: _id, content, chat });
  const latestMessage = await Chats.findByIdAndUpdate(chat,{latestMessage:content})
  res.status(200).json({ newMsg });
};

exports.getMsgs = async (req, res) => {
  const chat = req.params.chat;
  let messages = Object();
  const checkChat = await Chats.find({ users: req.user._id }).select("_id");
  let found = checkChat.find((e) => e._id == chat);
  if (found) {
    messages = await Messages.find({ chat }).populate("sender");
  } else {
    return res.status(403).json({
      status: "Fail",
      message: "U r not in this chat",
    });
  }
  res.status(200).json({
    status: "success",
    messages,
  });
};
