const socketio = require("socket.io");
const authcontroller = require("./authController");
const Chat = require("../Models/chatsModel");
const User = require("../Models/userModel");
const mongoose = require("mongoose");
const os = require("os");

exports.handelSockets = (server) => {
  const io = socketio(server);

  io.on("connection", async (socket) => {
    const curntUserToken = socket.handshake.headers.cookie?.split("=")[1];
    const userobj = await authcontroller.checkToken(curntUserToken);
    const userId = userobj.id;
    socket.join(userId);
    await User.findByIdAndUpdate(userId, { status: "online" });
    console.log("user now online");
    // const networkInterfaces = os.networkInterfaces();
    // const firstInterface = networkInterfaces[Object.keys(networkInterfaces)[0]];
    // const macAddress = firstInterface[0].mac;
    // console.log(macAddress);
    socket.on("join", (chatId) => {
      //leaving previous room if it exists
      const rooms = socket.rooms;
      rooms.forEach((room) => {
        if (room != socket.id && room != userId && room != chatId) {
          console.log("user left ", room);
          socket.leave(room);
        }
      });
      // joining user to the clicked chat
      socket.join(chatId);
      console.log("user joined ", chatId);
    });
    socket.on("disconnect", async () => {
      await User.findByIdAndUpdate(userId, { status: "offline" });
      console.log("user disconnected");
    });

    socket.on("chat msg", async (msg, chatId, senderId) => {
      console.log("Sending message to ", chatId);
      //sending a message
      //sender & current user is one person
      const currChat = await Chat.findById(chatId);
      //find the other user
      const otherUser = currChat.users.filter((user) => {
        if (user.toString() != new mongoose.Types.ObjectId(senderId)) {
          return user;
        }
      });
      console.log(otherUser.toString());
      console.log(socket.id);
      let roomUsersActive = io.sockets.adapter.rooms.get(chatId).size;
      console.log(io.sockets.adapter.rooms.get(chatId));

      if (otherUser.status == "offline" || roomUsersActive == 1) {
        //other is offline
        console.log("other is offline");
        io.in(otherUser.toString()).emit(
          "awayMsg",
          msg,
          otherUser.toString(),
          senderId,
          chatId
        );
      }
      console.log("message sent");
      io.in(chatId).emit("chatMsg", msg, chatId, senderId);
    });
  });
};
