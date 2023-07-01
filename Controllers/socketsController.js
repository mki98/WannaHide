const socketio = require("socket.io");
const authcontroller = require("./authController");
const Chat = require("../Models/chatsModel");
const User = require("../Models/userModel");
const mongoose = require("mongoose");
const Messages = require("../Models/messageModel");

exports.handelSockets = (server) => {
  const io = socketio(server);

  io.on("connection", async (socket) => {
    const curntUserToken = socket.handshake.headers.cookie?.split("=")[1];
    const userobj = await authcontroller.checkToken(curntUserToken);
    if (!userobj) {
      return socket.disconnect();
    }
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
      console.log(socket.id);
      let roomUsersActive = io.sockets.adapter.rooms.get(chatId).size;
      console.log(io.sockets.adapter.rooms.get(chatId));
      const { status } = await User.findById(otherUser.toString()).select(
        "status -_id"
      );
      console.log(status);
      if (status == "online" && roomUsersActive == 1) {
        //other is offline
        console.log("other is away");
        io.in(otherUser.toString()).emit(
          "awayMsg",
          msg,
          otherUser.toString(),
          senderId,
          chatId
        );
      }
      if (status == "offline" && roomUsersActive == 1) {
        console.log("user is offline");
        const newMsg = await Messages.create({
          sender: senderId,
          content: msg,
          chat: chatId,
        });
        console.log(newMsg, "Added to DB");
      }
      console.log("message sent");
      io.in(chatId).emit("chatMsg", msg, chatId, senderId);
    });
    socket.on("upload", (file, chatId, senderId) => {
      console.log("in back", file);
      io.in(chatId).emit("displayImg", file, chatId, senderId);
    });
    socket.on("retrived", async (chatID) => {
      const delQue = await Messages.deleteMany({ chat: chatID });
    });
  });
};
