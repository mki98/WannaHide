const { tryCatch } = require("../Utils/tryCatch");
const Chats = require("../Models/chatsModel");
const Users = require("../Models/userModel");

exports.createChat = tryCatch(async (req, res) => {
  const id = req.user._id.toString();
  var { users, isGroup } = req.body;

  users.push(id);
  let newChat
  if (!isGroup&&users.length<3) {
    newChat = await Chats.create({users})
  }
  // const newChat = await Chats.create({users,isGroup,admin,chatName});
  res.status(200).json({
    status:"Success",
    message: "Chat created",
    newChat

  });
});

exports.getChats = tryCatch(async(req,res)=>{
   const chats= await Chats.find({users:req.user._id}).populate("users")
   res.status(200).json({
    status:"Success",
    chats
   })

})