var chatWin = document.getElementById("chatNav");
var chatBox = document.getElementById("chatBox");
var formMessage = document.getElementById("formMessage");
var addFriend = document.getElementById("addFriend");
var userStatus = document.getElementById("user-status")
var latestMessage;
var time;
var Reqs = document.getElementById("btn-request");
const contacts = document.getElementsByName("contacts");
import { openDatabase, storeKeys } from "./indexDB.js";
import { generateSharedKey } from "./keyGen.js";

var resBtn;

function deriveKey(key, msgNum) {
  return CryptoJS.HmacSHA256(msgNum.toString(), key.toString()).toString();
}

var socket = io();

// request.onupgradeneeded = function(event) {
//   var db = event.target.result;

//   // Create a store called "keys" with a keypath called "id"
//   var store = db.createObjectStore('messages', { keyPath: 'id',autoIncrement:true });
// };

// request.onsuccess = function(event) {
//   var db = event.target.result;
//   console.log('Database opened successfully');
// };

// request.onerror = function(event) {
//   console.error('Error opening database:', event.target.error);
// };
var object;

$("#chatClick").click(function () {
  $("#chatHide").fadeToggle(1, function () {
    $("#profile").fadeOut(2000, function () {
      $("#requests-friend").fadeOut(2000, function () {
        $("#chat-id").css({ display: "block" });
      });
    });
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});
$("#contactClick").click(function () {
  $("#contactHide").fadeToggle(0, function () {
    $("#requests-friend").fadeOut();
    $("#chatHide").toggleClass("full", function () {
      $("#profile").fadeOut(2000);
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
  //! Add mongo db call to sync this indexed db with it 
  //!and decrrypt the messages from mongo and add it to the chat
  //! change message status to read
  
  var request = indexedDB.open("User", 1);

  request.onupgradeneeded = function (event) {
    var db = event.target.result;

    // Create a "users" store with a keypath called "id"
    var store = db.createObjectStore("keys", { keyPath: "id" });
  };

  request.onsuccess = async function (event) {
    var db = event.target.result;

    // Get a reference to the "users" store
    var transaction = db.transaction("keys", "readwrite");
    var store = transaction.objectStore("keys");

    // Get the user with the specified ID
    var request = await store.get(chatId);

    request.onsuccess = function (event) {
      var chat = event.target.result;

      if (!chat) {
        // User not found, create a new user object
        axios({
          method: "GET",
          url: `/api/v1/users/${otherUser}`,
        }).then(async (res) => {
          var OtherPublicKey = res.data.User[0].publicKey;
          var transaction = db.transaction("keys", "readwrite");
          var store = transaction.objectStore("keys");
          var privReq = await store.get(currentId);
          privReq.onsuccess = async function (e) {
            let PrivKey = e.target.result.privateKey;
            var sharedKey = generateSharedKey(BigInt(OtherPublicKey), PrivKey);
            await store.put({
              id: chatId,
              sharedKey,
              localCount: 0,
              remoteCount: 0,
            });
          };
        });

        console.log("New user object created");
      }
    };

    request.onerror = function (event) {
      console.error("Error retrieving user:", event.target.error);
    };
  };

  request.onerror = function (event) {
    console.error("Error opening database:", event.target.error);
  };


  //join clicked chat
  console.log("clicked chat", chatId);
  socket.emit("join", chatId);
  latestMessage = e.target.childNodes[3].childNodes[3];

  time = e.target.childNodes[3].childNodes[1].children[1];
  chatWin.innerHTML = ` <div class="img-user position-relative">
                                           ${e.target.childNodes[1].childNodes[1].outerHTML}
                                        </div>
                                        <div class="pt-2">
                                            <h4>${e.target.childNodes[3].childNodes[1].firstElementChild.innerText} <br> <span>online</span></h4>
                                        </div>`;

  let Chatsdb = indexedDB.open("Chats", 2);
  // Open the "chats" database with a version number of 1
  // var request = indexedDB.open('Chats', 1);

  Chatsdb.onupgradeneeded = function (event) {
    let db = event.target.result;
    let store;
    // Create a "messages" store with an autoincremented keypath
    if (!db.objectStoreNames.contains("messages")) {
      store = db.createObjectStore("messages", {
        keypath: "id",
        autoIncrement: true,
      });
    } else {
      store = event.target.transaction.objectStore("messages");
    }
    // Create a "chatId" index
    store.createIndex("chatId", "chatId", { unique: false });
  };

  Chatsdb.onsuccess = function (event) {
    let db = event.target.result;

    // Add the new message to the "messages" store
    let transaction = db.transaction("messages", "readonly");
    let messageStore = transaction.objectStore("messages");
    const index = messageStore.index("chatId");
    const query = index.openCursor(IDBKeyRange.only(chatId));

    // Loop through the results and log each document
    let msgs = "";
    query.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        msgs += `<div class="massage ${
          cursor.value.senderId == currentId ? "myMassage" : "friendMassage"
        }">
                                      <p> ${
                                        cursor.value.content
                                      }<br> <span>${new Date(
          Date.parse(cursor.value?.time) ///1234    890
        ).toLocaleString("en-EG", {
          hour12: true,
          hour: "numeric",
          minute: "2-digit",
        })}</span></p>
                                     </div>`;
        cursor.continue();
      }
      transaction.oncomplete = function (event) {
        chatBox.innerHTML = msgs;
        chatBox.scrollTop = chatBox.scrollHeight;
        console.log("Retrived Local Messages");
      };
    };
  };
  Chatsdb.onerror = function (event) {
    console.error("Error opening database:", event.target.error);
  };

  $("#chatHide").fadeIn(1000);
  $("#requests-friend").fadeOut(1000);
  $("#chat-id").css({ display: "block" });
});

//sender
function encrypt(msg, ratchetKey) {
  const cipher = CryptoJS.AES.encrypt(msg, ratchetKey);
  return cipher.toString();
}

if (formMessage) {
  formMessage.addEventListener("submit", async (e) => {
    e.preventDefault();
    currentId = e.target[1].attributes.sender.value;
    let content = e.target[1].value;
    if (content) {
      var request = indexedDB.open("User", 1);
      request.onsuccess = async function (e) {
        let db = e.target.result;
        let store = await db
          .transaction("keys", "readwrite")
          .objectStore("keys");
        let req = await store.get(chatId);
        req.onsuccess = async function (e) {
          //sender
          //encrypt message
          let localCount = e.target.result.localCount;
          let sharedKey = e.target.result.sharedKey;
          let ratchetKey = deriveKey(sharedKey, localCount);
          let encMess = encrypt(content, ratchetKey);
          //send Encrypted message to other user
          socket.emit("chat msg", encMess, chatId, currentId);
          console.log("encrypted message", encMess);
          //display message on screen

          var msgHtml = ` <div class="massage myMassage" >
        <p> ${content}<br> <span>${new Date(Date.now()).toLocaleString(
            "en-EG",
            {
              hour12: true,
              hour: "numeric",
              minute: "2-digit",
            }
          )}</span></p>
       </div> `;
          console.log(content);
          chatBox.innerHTML += msgHtml;
          chatBox.scrollTop = chatBox.scrollHeight;
          latestMessage.innerHTML = `<p>${content}</p>`;
          time.innerText = `${new Date(Date.now()).toLocaleString("en-EG", {
            hour12: true,
            hour: "numeric",
            minute: "2-digit",
          })}`;
          let addLoc = await db
            .transaction("keys", "readwrite")
            .objectStore("keys");
          let addReq = await addLoc.get(chatId);
          addReq.onsuccess = function (e) {
            let data = e.target.result;
            data.localCount = data.localCount + 1;
            let updateRem = addLoc.put(data);
            updateRem.onsuccess = function (e) {
              console.log(e);
            };
          };
          addReq.onerror = function (e) {
            console.log(e.target.error);
          };
          // Open the "chats" database with a version number of 1
          var request = indexedDB.open("Chats", 2);

          request.onupgradeneeded = function (event) {
            var db = event.target.result;

            // Create a "messages" store with an autoincremented keypath
            var store = db.createObjectStore("messages", {
              keypath: "id",
              autoIncrement: true,
            });
          };

          request.onsuccess = function (event) {
            var db = event.target.result;

            // Add the new message to the "messages" store
            var transaction = db.transaction("messages", "readwrite");
            var store = transaction.objectStore("messages");
            var message = {
              content: content,
              senderId: currentId,
              chatId: chatId,
              time: new Date(Date.now()),
            };
            store.add(message);

            transaction.oncomplete = function (event) {
              console.log("Message added to database:", message);
            };
          };

          request.onerror = function (event) {
            console.error("Error opening database:", event.target.error);
          };

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
        };
        req.onerror = function (e) {
          console.log(e.target.error);
        };
      };
    }
  });
}
//reciver
function decrypt(enc, ratchetKey) {
  const cipher = CryptoJS.AES.decrypt(enc, ratchetKey);
  return cipher.toString(CryptoJS.enc.Utf8);
}
socket.on("chatMsg", async (enc, chatID, senderId) => {
  //decrypt the message
  if (senderId !== currentId) {
    // alert(`u r ${currentId},other person ${senderId }`)
    //when not joined


    let remoteCount;
    let sharedKey;
    console.log("reciver");
    var request = indexedDB.open("User", 1);
    request.onsuccess = async function (e) {
      let db = e.target.result;
      let store = await db.transaction("keys", "readwrite").objectStore("keys");
      let req = await store.get(chatID);
      req.onsuccess = async function (e) {
        remoteCount = e.target.result.remoteCount;
        sharedKey = e.target.result.sharedKey;

        let ratchetKey = deriveKey(sharedKey, remoteCount);
        let msg = decrypt(enc, ratchetKey);
        console.log(decrypt(enc, ratchetKey));
        console.log("jdijdijijijij", msg, chatID, senderId);
        //get chat and update remote count value
        let keysdb = await openDatabase("User", 1);
        let keysObj = await keysdb
          .transaction("keys", "readwrite")
          .objectStore("keys");
        let keysReq = await keysObj.get(chatID);
        keysReq.onsuccess = async function (e) {
          let data = e.target.result;
          data.remoteCount++;
          // let keysdb = await openDatabase("User", 1);
          //  let keysObj = await keysdb
          // .transaction("keys", "readwrite")
          // .objectStore("keys");
          // let updateRem = await keysObj.put(data);
          // updateRem.onsuccess = function (e) {
          //   console.log(e);
          // };
        };
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

        // Open the "chats" database with a version number of 1
        var request = indexedDB.open("Chats", 2);

        request.onupgradeneeded = function (event) {
          var db = event.target.result;

          // Create a "messages" store with an autoincremented keypath
          var store = db.createObjectStore("messages", {
            keyPath: "id",
            autoIncrement: true,
          });
        };

        request.onsuccess = function (event) {
          var db = event.target.result;

          // Add the new message to the "messages" store
          var transaction = db.transaction("messages", "readwrite");
          var store = transaction.objectStore("messages");
          var message = {
            content: msg,
            senderId: senderId,
            chatId: chatID,
            time: new Date(Date.now()),
          };
          store.add(message);

          transaction.oncomplete = function (event) {
            console.log("Message added to database:", message);
          };
        };

        request.onerror = function (event) {
          console.error("Error opening database:", event.target.error);
        };
      };
    };
  }
});
socket.on("awayMsg", async (enc, currentId, senderId, chatID) => {
  alert(`message ${enc}from ${senderId} because u ${currentId} is away`);
  console.log(contacts);
  let chat;
  for(var i=0;i<contacts.length;i++){
    if(contacts[i].id == chatID){
      chat = contacts[i];
      break;
    }
  }
  //!save it to mongoDB 
  //!change latest message in mongo to this message 
  //!change the order and make it at the top of chats
  //!add unread icon to it 

  
});
$("#img-menu").click(function () {
  $("#menu").slideToggle(1000);
});

$("#setting").click(function () {
  $("#profile").fadeIn(500, function () {
    $("#contactHide").fadeOut(500, function () {
      $("#chatHide").fadeOut(500, function () {
        $("#requests-friend").fadeOut(1000);
      });
    });
  });
});

$("#addClick").click(function () {
  addFriend.addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.target[0].value) {
      var friend = e.target[0].value;
      axios({
        method: "POST",
        url: "/api/v1/users/contacts",
        data: {
          friend,
        },
      })
        .then((res) => {
          if (res.status == 200) {
            setTimeout(()=>{
              if(userStatus.classList.contains("green"))
              {
                console.log(" green");
                userStatus.innerHTML=`${res.data.message}`;
              }
              else{
                console.log("else green");
                userStatus.classList.replace("red","green")
                userStatus.innerHTML=`${res.data.message}`;
              }
            },2000)
            setTimeout(()=>{
              userStatus.innerHTML="";
            },4000)
          }
        })
        .catch((err) => {
          console.log(err);
          setTimeout(()=>{
            if(userStatus.classList.contains("red"))
              {
                console.log("red");
                userStatus.innerHTML=`${err.response.data.message}`;
              }
              else{
                console.log("else red");
                userStatus.classList.replace("green","red")
                userStatus.innerHTML=`${err.response.data.message}`;
              }
          
          },0)
          setTimeout(()=>{
            userStatus.innerHTML="";
          
          },4000)

        });
      e.target[0].value = "";
    }
  });
  $(".inputAdd").toggle(1000);
});

$("#btn-request").click(function () {
  $("#requests-friend").fadeIn(0, function () {
    $("#chatHide").fadeOut(0, function () {
      $("#chat-id").css({ display: "none" });
    });
  });
});

$(function () {
  $("#fileupload").change(function (e) {
    var read = URL.createObjectURL(e.target.files[0]);
    $("#upload-img").attr("src", read);
    $(".boximage").css({ display: "block" });
    $("#chatBox").css({ display: "none" });
  });
});
$("#exit").click(function () {
  $("#chatBox").css({ display: "block" });
  $(".boximage").css({ display: "none" });
});

var reqBod = document.getElementById("reqBod");
Reqs.addEventListener("click", (e) => {
  e.preventDefault();
  reqBod.innerHTML = "";
  axios({
    method: "GET",
    url: "/api/v1/users/requests",
  })
    .then((res) => {
      console.log(res);
      for (var i = 0; i < res.data.requests.length; i++) {
        reqBod.innerHTML += ` <tr>
      <td class="pt-3" >${res.data.requests[i].username}</td>
      <td class="action-request d-flex justify-content-center align-items-center">
          <div class="iconR accept"id="${res.data.requests[i]._id}-accept">
              <i class="fa-solid fa-check disabled" ></i>
              
          </div>
          <div class="iconR reject" id="${res.data.requests[i]._id}-reject">
              <i class="fa-solid fa-xmark disabled"></i>
          </div>
      </td>
  </tr>`;
      }
      handleFriendReq();
    })
    .catch((e) => {
      console.log(e);
    });
});
function handleFriendReq() {
  resBtn = document.querySelectorAll(".accept, .reject");
  resBtn.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      console.log(e.target.id.split("-")[0], e.target.id.split("-")[1]);
      let data = { request: e.target.id.split("-")[0] };
      e.target.id.split("-")[1] == "accept"
        ? (data.respond = true)
        : (data.respond = false);
      console.log(data);

      axios({
        method: "POST",
        url: "/api/v1/users/requests",
        data,
      })
        .then((res) => {
          console.log(res);
          if (res.data.status == "Success") {
            window.location.reload();
          }
        })
        .catch((e) => {
          console.log(e);
          alert(e.response.data.message);
        });
    });
  });
}
