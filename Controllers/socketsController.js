const socketio = require("socket.io");
const authcontroller = require("./authController");
const Chat = require("../Models/chatsModel");
const mongoose = require("mongoose");
const os = require("os");

exports.handelSockets = (server) => {
  const io = socketio(server);

  io.on("connection", async(socket) => {
    const curntUserToken = socket.handshake.headers.cookie.split("=")[1];
    const userobj= await authcontroller.checkToken(curntUserToken)
    const userId=userobj.id
    socket.join(userId)
    // const networkInterfaces = os.networkInterfaces();
    // const firstInterface = networkInterfaces[Object.keys(networkInterfaces)[0]];
    // const macAddress = firstInterface[0].mac;
    // console.log(macAddress);
    socket.on("join", (chatId) => {
      // joining user to the clicked chat
      socket.join(chatId);
      //calculate privte public

      console.log("user joined ", chatId);
    });
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    
    socket.on("chat msg", async (msg, chatId, senderId) => {
      //sending a message
      //sender & current user is one person 
      const currChat = await Chat.findById(chatId)
      //find the other user
      const otherUser = currChat.users.filter((user)=>{
        if(user.toString()!= new mongoose.Types.ObjectId(senderId)){
      return user}
      })
      console.log(otherUser.toString())
      
      io.in(otherUser.toString()).emit("awayMsg", msg, otherUser.toString(), senderId,chatId);
      io.in(chatId).emit("chatMsg", msg, chatId, senderId);
    });
  });
};
