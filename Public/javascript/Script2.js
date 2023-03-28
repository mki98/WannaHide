var user = document.querySelectorAll("#user");
var chatWin = document.getElementById("chatNav");
var chatBox = document.getElementById("chatBox");
var formMessage = document.getElementById("formMessage");
var menu = document.getElementById("menu");
var setting = document.getElementById("setting");
var profile = document.getElementById("profile");
var addFriend = document.getElementById("addFriend");
var latestMessage;
var time;
import { openDatabase, storeKeys } from "./indexDB.js";
import { generateSharedKey } from "./keyGen.js";
const db1 = await openDatabase("User", 1);

let store=  await db1
.transaction("keys", "readwrite")
.objectStore("keys");
let req= await store.get('64220fa7dba3222842240dcf')
req.onsuccess=function(e){
  let remoteCount=e.target.result.remoteCount
let sharedKey = e.target.result.sharedKey
let ratchetKey = deriveKey(sharedKey, remoteCount);
  function deriveKey(key, msgNum) {
    // return crypto.createHmac("sha256", key).update(String(msgNum)).digest();
    return CryptoJS.HmacSHA256(msgNum.toString(),key.toString()).toString()//fjij

  }///orkorkokc
//sender
 function encrypt(msg,ratchetKey) {
  var randomBytes = new Uint8Array(16);
  const iv = window.crypto.getRandomValues(randomBytes);
  const cipher = CryptoJS.AES.encrypt(msg,ratchetKey);
  return cipher.toString()
}
function decrypt(enc,ratchetKey) {

  // const iv = Buffer.from(enc.slice(0, 24), 'base64');
  const cipher =CryptoJS.AES.decrypt(enc,ratchetKey);
  return cipher.toString(CryptoJS.enc.Utf8);
  }
for(var i=0;i<2;i++){
let crp=encrypt("hello",deriveKey(sharedKey,i))
console.log("encrip",crp)
let txt =decrypt(crp,deriveKey(sharedKey,i))
console.log("decrypt",txt)
}

//encrypt message
//11sk  ->1

console.log(sharedKey.toString())
}
var socket = io();
const db = await openDatabase("User", 1);
var object;

console.log(user);
for (var i = 0; i < user.length; i++) {
  user[i].addEventListener("click", function (e) {
    $("#ourChat").fadeIn(1000 ,function(){
      $("#requests-friend").fadeOut(1000 ,function(){
        $("#chat-id").css({"display": "block"})
      })
    });
    
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
$("#chatClick").click(function () {
  $("#chatHide").fadeToggle(1, function () {
    $("#profile").fadeOut(2000 , function(){
      $("#requests-friend").fadeOut(2000 ,function(){
        $("#chat-id").css({"display": "block"})
      })
    });
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});
$("#contactClick").click(function () {
  $("#contactHide").fadeToggle(0, function(){
    $("#requests-friend").fadeOut()
    $("#chatHide").toggleClass("full" ,function(){
      $("#profile").fadeOut(2000)
    });
  });
  chatBox.scrollTop = chatBox.scrollHeight;
  //   $("#chatHide").tog(1000);
});

let chatId = "";
let currentId = formMessage.childNodes[1].childNodes[5].attributes[1].value;

$(".contact").click(async (e) => {
  chatId = e.target.id;
  let otherUser = e.target.childNodes[3].childNodes[1].childNodes[1].innerText;
  if (db) {
    object = await db.transaction("keys").objectStore("keys");
  }
  const r = object.get(chatId);
  r.onsuccess = function (e) {
    console.log(e.target.result);
    if (!e.target.result) {
      axios({
        method: "GET",
        url: `/api/v1/users/${otherUser}`,
      }).then(async (res) => {
        var OtherPublicKey = res.data.User[0].publicKey;
        if (db) {
          object = await db.transaction("keys").objectStore("keys");
        }
        var privReq = object.get(currentId);
        var PrivKey;
        privReq.onsuccess = async function (e) {
          PrivKey = e.target.result.privateKey;
          var sharedKey = generateSharedKey(BigInt(OtherPublicKey), PrivKey);
          object = await db
            .transaction("keys", "readwrite")
            .objectStore("keys");
          object.put({ id: chatId, sharedKey, localCount: 0, remoteCount: 0 });
          console.log("key stored");
        };
      });
    }
  };
  r.onerror = function (e) {
    console.log(e.target.error);
  };
  //join clicked chat
  socket.emit("join", chatId);
  latestMessage = e.target.childNodes[3].childNodes[3].childNodes[1];
  time = e.target.childNodes[3].childNodes[1].children[1];
  chatWin.innerHTML = ` <div class="img-user position-relative">
                                           ${e.target.childNodes[1].childNodes[1].outerHTML}
                                        </div>
                                        <div class="pt-2">
                                            <h4>${e.target.childNodes[3].childNodes[1].firstElementChild.innerText} <br> <span>online</span></h4>
                                        </div>`;

  var messagedb = await openDatabase("Chats", 1, [
    { name: "messages", keyPath: "ChatId" },
  ]);
  console.log(messagedb);
  // var store =  messagedb.transaction("messages",'readwrite').objectStore("messages")

  var store = await messagedb.transaction("messages").objectStore("messages");
  var req = store.getAll(chatId);
  req.onsuccess = function (e) {
    if (e.target.result.length > 0) {
      var msgs = "";
      e.target.result.forEach((element) => {
        msgs += `<div class="massage ${
          element.senderId == currentId ? "myMassage" : "friendMassage"
        }">
                              <p> ${element.content}<br> <span>${new Date(
          Date.parse(element?.time) ///1234    890
        ).toLocaleString("en-EG", {
          hour12: true,
          hour: "numeric",
          minute: "2-digit",
        })}</span></p>
                             </div>`;
      });
      chatBox.innerHTML = msgs;
      chatBox.scrollTop = chatBox.scrollHeight;
    }
    //chatId sender time content
  };
  req.onerror = function (e) {
    console.log(e.target.error);
  };

  // axios({
  //   method: "GET",
  //   url: `/api/v1/messages/${chatId}`,
  // }).then((res) => {
  //   var msgs = "";
  //   console.log(res);
  //   var data = res.data.messages;
  //   for (let i = 0; i < data.length; i++) {
  //     msgs += `<div class="massage ${
  //       data[i].sender.username ==
  //       e.target.childNodes[3].childNodes[1].firstElementChild.innerText
  //    //     ? "friendMassage"
  //         : "myMassage"
  //     }">
  //                     <p> ${data[i].content}<br> <span>${new Date(
  //       Date.parse(data[i].time)///1234    890
  //     ).toLocaleString("en-EG", {
  //       hour12: true,
  //       hour: "numeric",
  //       minute: "2-digit",
  //     })}</span></p>
  //                    </div>`;
  //   }
  //   chatBox.innerHTML = msgs;
  //   chatBox.scrollTop = chatBox.scrollHeight;
  // });

  $("#chatHide").fadeIn(1000);
  $("#requests-friend").fadeOut(1000)
  $("#chat-id").css({"display": "block"})

});

if (formMessage) {
  formMessage.addEventListener("submit",async  (e) => {
    e.preventDefault();
    currentId = e.target[1].attributes.sender.value;
    console.log(currentId);
    let content = e.target[1].value;
    if (content) {
      let store=  await db
            .transaction("keys", "readwrite")
            .objectStore("keys");
       let req= await store.get(chatId)
       req.onsuccess=function(e){
      //sender
      //encrypt message
      //11sk  ->1
      let localCount=e.target.result.localCount
      let sharedKey = e.target.result.sharedKey

      
      
      socket.emit("chat msg", content, chatId, currentId,sharedKey.toString(),localCount);


      // e.target[0].value = "";

      // axios({
      //   method: "POST",
      //   url: `/api/v1/messages`,

      //   data: {
      //     content,
      //     chat: chatId,
      //   },
      // }).then((res) => {
      //   console.log(res);
      // });
    }
    }
  });
}
//reciver
socket.on("chatMsg", (msg, chatId, senderId) => {
  //decrypt the message

  console.log(msg, chatId, senderId);
  var msgHtml = ` <div class="massage ${
    senderId == currentId ? "myMassage" : "friendMassage"
  } ">
  <p> ${msg}<br> <span>${new Date(Date.now()).toLocaleString("en-EG", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  })}</span></p>
 </div> `;
  chatBox.innerHTML += msgHtml;
  chatBox.scrollTop = chatBox.scrollHeight;
  latestMessage.innerHTML = `<p>${msg}</p>`;
  time.innerText = `${new Date(Date.now()).toLocaleString("en-EG", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  })}`;

  msg = "";
});




$("#img-menu").click (function(){
  $("#menu").slideToggle(1000)
})


$("#setting").click (function(){
  $("#profile").fadeIn(500,function(){
    $("#contactHide").fadeOut(500 , function(){
      $("#chatHide").fadeOut(500 , function(){
        $("#requests-friend").fadeOut(1000)
      })
    })
  })
})

$("#addClick").click (function(){
  addFriend.addEventListener('submit',(e)=>{
    e.preventDefault()
    if(e.target[0].value){
      var friend = e.target[0].value
      axios({
        method: "POST",
        url: "/api/v1/users/contacts",
        data: {
          friend,
        },
      })
        .then((res) => {
          if (res.status == 200) {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
          alert(err.response.data.message);
        });
      e.target[0].value = "";
    }
  });
  $(".inputAdd").toggle(1000);
});



$("#btn-request").click(function(){
  $("#requests-friend").fadeIn(0 , function(){
    $("#chatHide").fadeOut(0, function(){
      $("#chat-id").css({"display": "none"})
    })
  })

})




  
$(function(){
$("#fileupload").change(function(e){
  var read =URL.createObjectURL(e.target.files[0]);
  $("#upload-img").attr("src", read)
  $(".boximage").css({"display": "block"})
$("#chatBox").css({"display": "none"})
})

})
$("#exit").click(function(){
  $("#chatBox").css({"display": "block"})
  $(".boximage").css({"display": "none"})


})



 