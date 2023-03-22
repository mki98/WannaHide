const socketio = require('socket.io');
const authcontroller = require('./authController')



exports.handelSockets=(server)=>{
    const io = socketio(server)
    
    io.on("connection", (socket) => {
        console.log("user conected");
        
        // console.log(socket.handshake.headers.cookie.split('=')[1])
        // authcontroller.checkToken(socket.handshake.headers.cookie.split('=')[1])
        socket.on("join", (chatId) => {
            // joining user to the clicked chat
            socket.join(chatId)
            console.log('user joined ',chatId)
           });
        socket.on("disconnect", () => {
          console.log("user disconnected");
        });
      
        socket.on("chat msg", (msg, chatId,senderId) => {
          //sending a message
          console.log(chatId)
          io.in(chatId).emit("chatMsg", msg,chatId,senderId);
        });
      });
      

}    