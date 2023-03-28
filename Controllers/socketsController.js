const socketio = require("socket.io");
const authcontroller = require("./authController");
const mongoose = require("mongoose");
const crypto = require("crypto");
// const crypto = require("crypto");

// /** Generates BigInts between low (inclusive) and high (exclusive) */
// function generateRandomBigInt(lowBigInt, highBigInt) {
//   if (lowBigInt >= highBigInt) {
//     throw new Error("lowBigInt must be smaller than highBigInt");
//   }

//   const difference = highBigInt - lowBigInt;
//   const differenceLength = difference.toString().length;
//   let multiplier = "";
//   while (multiplier.length < differenceLength) {
//     multiplier += Math.random().toString().split(".")[1];
//   }
//   multiplier = multiplier.slice(0, differenceLength);
//   const divisor = "1" + "0".repeat(differenceLength);

//   const randomDifference = (difference * BigInt(multiplier)) / BigInt(divisor);

//   return lowBigInt + randomDifference;
// } //Master Math
// class KeyPairs {
//   constructor() {
//     this.primeN =
//       5809605995369958062791915965639201402176612226902900533702900882779736177890990861472094774477339581147373410185646378328043729800750470098210924487866935059164371588168047540943981644516632755067501626434556398193186628990071248660819361205119793693985433297036118232914410171876807536457391277857011849897410207519105333355801121109356897459426271845471397952675959440793493071628394122780510124618488232602464649876850458861245784240929258426287699705312584509625419513463605155428017165714465363094021609290561084025893662561222573202082865797821865270991145082200656978177192827024538990239969175546190770645685893438011714430426409338676314743571154537142031573004276428701433036381801705308659830751190352946025482059931306571004727362479688415574702596946457770284148435989129632853918392117997472632693078113129886487399347796982772784615865232621289656944284216824611318709764535152507354116344703769998514148343807n;
//     this.generator = 2n;
//     this.privateKey = generateRandomBigInt(this.generator, this.primeN - 2n);
//     this.publicKey = (this.generator ^ this.privateKey) % this.primeN;;
//   }
//   generateShared(publicOther){
//     const shared = (publicOther^this.privateKey) % this.primeN;
//     return shared;
//   }
// }

// var h = new KeyPairs()
// console.log(h.privateKey, h.publicKey)

exports.handelSockets = (server) => {
  const io = socketio(server);

  io.on("connection", (socket) => {
    console.log("user conected");
    // const client = mongoose.connection.client;
    // const db = client.db("chatApp");
    // const collection = db.collection("messages");
    // const changeStream = collection.watch();
    // changeStream.on("change", (next) => {
    //   socket.emit("notifiy", next.fullDocument)
    // });
    // console.log(socket.handshake.headers.cookie.split('=')[1])
    // authcontroller.checkToken(socket.handshake.headers.cookie.split('=')[1])
    socket.on("join", (chatId) => {
      // joining user to the clicked chat
      socket.join(chatId);
      //calculate privte public

      console.log("user joined ", chatId);
    });
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("chat msg", (msg, chatId, senderId,sharedKey,localCount) => {
      //sending a message
      function deriveKey(key, msgNum) {
        return crypto.createHmac("sha256", key).update(String(msgNum)).digest();
      }
      function encrypt(msg,ratchetKey) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", ratchetKey, iv);
        return (
          iv.toString("base64") +
          cipher.update(msg, "utf8", "base64") +
          cipher.final("base64")
        );
      }
      let ratchetKey;
      ratchetKey = deriveKey(sharedKey, localCount);
      console.log("Ratchet Key", ratchetKey);
      let ciphertext = encrypt(msg,ratchetKey)
      console.log("encrypted", ciphertext)
      console.log("localCount", localCount)

      io.in(chatId).emit("decrypt", ciphertext, chatId, senderId);
    });

    socket.on("decrypt",(msg,)=>{

    })
  });
};
