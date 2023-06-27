let chatWin = document.getElementById("chatNav");
let chatBox = document.getElementById("chatBox");
let formMessage = document.getElementById("formMessage");
let addFriend = document.getElementById("addFriend");
let userStatus = document.getElementById("user-status");
let latestMessage;
let time;
let Reqs = document.getElementById("btn-request");
const contacts = document.getElementsByName("contacts");

import { openDatabase} from "./indexDB.js";
import { generateSharedKey, Elgamal } from "./keyGen.js";
var resBtn;

function deriveKey(key, msgNum) {
  return CryptoJS.HmacSHA256(msgNum.toString(), key.toString()).toString();
}
//sender
function encrypt(msg, ratchetKey) {
  const cipher = CryptoJS.AES.encrypt(msg, ratchetKey);
  return cipher.toString();
}
//receiver
function decrypt(enc, ratchetKey) {
  const cipher = CryptoJS.AES.decrypt(enc, ratchetKey);
  return cipher.toString(CryptoJS.enc.Utf8);
}

var socket = io();

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
});

let chatId = "";
let currentId = formMessage.childNodes[1].childNodes[5].attributes[1].value;
let otherUser = "";
let otherUserPub = "";
$(".contact").click(async (e) => {
  chatId = e.target.id;
  otherUser = e.target.childNodes[3].childNodes[1].childNodes[1].innerText;
  axios({
    method: "GET",
    url: `/api/v1/users/${otherUser}`,
  }).then(async (res) => {
    otherUserPub = res.data.User[0].publicKey;
  });
  
  var request = indexedDB.open("User", 1);

  request.onupgradeneeded = function (event) {
    var db = event.target.result;

    // Create a "users" store with a keypath called "id"
    db.createObjectStore("keys", { keyPath: "id" });
  };

  request.onsuccess = async function (event) {
    var db = event.target.result;

    // Get a reference to the "users" store
    var transaction = db.transaction("keys", "readwrite");
    var store = transaction.objectStore("keys");

    // Get the user with the specified ID
    var request = await store.get(chatId);

    request.onsuccess = async function (event) {
      var chat = event.target.result;

      if (!chat) {
        // Chat not found, create a new chat object
        var OtherPublicKey = res.data.User[0].publicKey;
        var transaction = db.transaction("keys", "readwrite");
        var store = transaction.objectStore("keys");
        var privReq = await store.get(currentId);
        privReq.onsuccess = async function (e) {
          let PrivKey = e.target.result.privateKey;
          var sharedKey = generateSharedKey(OtherPublicKey, PrivKey);
          await store.put({
            id: chatId,
            sharedKey,
            localCount: 0,
            remoteCount: 0,
          });
        };

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
  const delaiedMsgs = await axios({
    method: "GET",
    url: `api/v1/messages/${chatId}`,
  });
  const unreadMsgs = delaiedMsgs.data.messages;

  latestMessage = e.target.childNodes[3].childNodes[3];
  time = e.target.childNodes[3].childNodes[1].children[1];
  chatWin.innerHTML = ` <div class="img-user position-relative">
  ${e.target.childNodes[1].childNodes[1].outerHTML}
  </div>
  <div class="pt-2">
  <h4>${e.target.childNodes[3].childNodes[1].firstElementChild.innerText} <br> <span>online</span></h4>
  </div>`;
  e.target.childNodes[5]?.remove();

  // Open the "chats" database with a version number of 2
  let Chatsdb = indexedDB.open("Chats", 2);
  //! Add query messages enc from db to keep it up to date with local
  //! after finsih append it to the local storage
  //! then delete it from db by calling retrevied
  //! *TRY TO CREATE A TRANSACTION THAT ONLY CHANGES THE COUNTER WHEN THINGS ARE DONE*
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
        var good = 0;
        if (unreadMsgs.length > 0) {
          unreadMsgs.forEach((msger) => {
            if (msger.sender._id != currentId) {
              ReciverMessage(msger.content, chatId, msger.sender._id);
              good = 1;
            }
          });
        }
        chatBox.scrollTop = chatBox.scrollHeight;
        console.log("Retrived Local Messages");

        if (good == 1) {
          socket.emit("retrived", chatId);
        }
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

socket.on("displayImg", (url, chatId, senderId) => {
  if (senderId == currentId) {
    return;
  }
  console.log("in blob");
  // Create an image element and set its source to the URL
  const img = new Image();
  let rat = deriveKey(1, 1);
  console.log(url.astr);
  let urla = new BigInteger(url.astr);
  let urlb = new BigInteger(url.bstr);
  let pubstr = new BigInteger(url.pubstr);
  let privstr = new BigInteger(url.privstr);
  url = { a: urla, b: urlb };
  img.src = Elgamal.prototype.decryptGamal(url, privstr, pubstr);
  console.log(img);

  // Add the image element to the DOM
  // document.body.appendChild(img);
  chatBox.innerHTML += `<div class="massage friendMassage">
                                       
    <p>
       <img src="${img.src}" alt="">
       <br> 
       <span>08:55</span>
    </p>
    </div>`;
});

if (formMessage) {
  formMessage.addEventListener("submit", async (e) => {
    e.preventDefault();
    currentId = e.target[1].attributes.sender.value;
    let imgContent = e.target[0].files[0];
    if (imgContent && imgContent.type.includes("image")) {
      console.log(imgContent);
      var reader = new FileReader();
      // reader.readAsBinaryString(imgContent);
      reader.readAsArrayBuffer(imgContent); //base64
      reader.onload = function (e) {
        let imgStr = e.target.result;
        console.log(imgStr);
        let rat = deriveKey(1, 1);
        let enco = encrypt(imgStr, rat);
        console.log(enco);
        chatBox.innerHTML += `<div class="massage myMassage">
                                       
    <p>
       <img src="${imgStr}" alt="">
       <br> 
       <span>${new Date(Date.now()).toLocaleString(
            "en-EG",
            {
              hour12: true,
              hour: "numeric",
              minute: "2-digit",
            }
        )}</span>
    </p>
    </div>`;
        socket.emit("upload", enco, chatId, currentId);
      };
    }
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
          //modified by 1
          let ratchetKey = deriveKey(sharedKey, localCount);
          console.log("ratchetKey->", ratchetKey);
          // let encMess = encrypt(content, ratchetKey);
          let encMess = Elgamal.prototype.encryptGamal(content,new BigInteger(otherUserPub));
          console.log("encMess->", encMess);
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
            //!localCount
            let data = e.target.result;
            data.localCount = data.localCount + 1;
            let updateLoc = addLoc.put(data);
            updateLoc.onsuccess = function (e) {
              console.log(e);
            };
          };
          addReq.onerror = function (e) {
            console.log(e.target.error);
          };
          // Open the "chats" database with a version number of 2
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
        };
        req.onerror = function (e) {
          console.log(e.target.error);
        };
      };
    }
  });
}
let myPubKey="";
let myPrivKey="";

async function increaseRemote(chatID) {
  let keysdb = await openDatabase("User", 1);
  let keysObj = await keysdb
      .transaction("keys", "readwrite")
      .objectStore("keys");
  let keysReq = await keysObj.get(chatID);
  keysReq.onsuccess = async function (e) {
    //!remoteCount
    let data = e.target.result;
    data.remoteCount = data.remoteCount + 1;
    let updateRem = keysObj.put(data);
    updateRem.onsuccess = function (e) {
      console.log(data.remoteCount);
    };
  };
}

function htmlMessage(senderId, msg) {
  return ` <div class="massage ${
      senderId == currentId ? "myMassage" : "friendMassage"
  } ">
  <p> ${msg}<br> <span>${new Date(Date.now()).toLocaleString("en-EG", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  })}</span></p>
 </div> `;
}

function displayMessage(msgHtml, msg, senderId, chatID) {
  chatBox.innerHTML += msgHtml;
  chatBox.scrollTop = chatBox.scrollHeight;
  latestMessage.innerHTML = `<p>${msg}</p>`;
  time.innerText = `${new Date(Date.now()).toLocaleString("en-EG", {
    hour12: true,
    hour: "numeric",
    minute: "2-digit",
  })}`;
  // Open the "chats" database with a version number of 2
  storeMessageInLocDB(msg, senderId, chatID)
}

socket.on("chatMsg", async (enc, chatID, senderId) => {
  console.log("I AM FIRED");
  //decrypt the message
  if (senderId !== currentId) {
    // alert(`u r ${currentId},other person ${senderId }`)
    //when not joined


  }
});
let messageCount = 0;
socket.on("awayMsg", async (enc, currentId, senderId, chatID) => {
  alert(`U have a new message`);
  console.log(contacts);

  let chat;
  for (var i = 0; i < contacts.length; i++) {
    if (contacts[i].id == chatID) {
      chat = contacts[i];
      break;
    }
  }
  messageCount = chat.childNodes[5]?.innerText
    ? chat.childNodes[5].innerText
    : 0;

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
      //modified by 1
      let ratchetKey = deriveKey(sharedKey, remoteCount);
      let msg = decrypt(enc, ratchetKey);

      console.log(decrypt(enc, ratchetKey));
      //!change the order and make it at the top of chats
      //!add unread icon to it
      chat.childNodes[3].childNodes[3].innerText = msg;
      messageCount++;
      if (!chat.childNodes[5]) {
        let b = document.createElement("b");
        b.classList.add("text-light", "bg-success");
        chat.appendChild(b);
      }
      chat.childNodes[5].innerText = messageCount;

      // b.innerText = messageCount
      document.getElementById("chatList").prepend(chat);

      console.log("jdijdijijijij", msg, chatID, senderId);
      //get chat and update remote count value
      await increaseRemote(chatID);
      storeMessageInLocDB(msg, chatID, senderId);
    };
  };
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
            setTimeout(() => {
              if (userStatus.classList.contains("green")) {
                console.log(" green");
                userStatus.innerHTML = `${res.data.message}`;
              } else {
                console.log("else green");
                userStatus.classList.replace("red", "green");
                userStatus.innerHTML = `${res.data.message}`;
              }
            }, 2000);
            setTimeout(() => {
              userStatus.innerHTML = "";
            }, 4000);
          }
        })
        .catch((err) => {
          console.log(err);
          setTimeout(() => {
            if (userStatus.classList.contains("red")) {
              console.log("red");
              userStatus.innerHTML = `${err.response.data.message}`;
            } else {
              console.log("else red");
              userStatus.classList.replace("green", "red");
              userStatus.innerHTML = `${err.response.data.message}`;
            }
          }, 0);
          setTimeout(() => {
            userStatus.innerHTML = "";
          }, 4000);
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

//Handle firend request
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

function storeMessageInLocDB(msg, senderId, chatID) {
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
}

async function ReciverMessage(enc, chatID, senderId) {

  let remoteCount;
  let sharedKey;
  var request = indexedDB.open("User", 1);
  request.onsuccess = async function (e) {
    let db = e.target.result;
    let store = await db.transaction("keys", "readwrite").objectStore("keys");
    if(!myPubKey){
      let reqPub= await store.get(currentId);
      reqPub.onsuccess = async function (e) {
        let data = e.target.result;
        console.log(data.publicKey)
        myPubKey=data.publicKey;
        myPrivKey=data.privateKey;
      }
    }
    let req = await store.get(chatID);
    req.onsuccess = async function (e) {
      remoteCount = e.target.result.remoteCount;
      console.log("remoteCount", remoteCount);
      sharedKey = e.target.result.sharedKey;
      //modified by 1
      let ratchetKey = deriveKey(sharedKey, remoteCount);
      // let msg = decrypt(enc, ratchetKey);
      let msg = Elgamal.prototype.decryptGamal(enc,new BigInteger(myPrivKey),new BigInteger(myPubKey));
      console.log(enc);
      console.log(msg);
      //get chat and update remote count value
      await increaseRemote(chatID);
      let msgHtml = htmlMessage(senderId, msg);
      displayMessage(msgHtml, msg, senderId, chatID);
    };
  };
}

//decrypts the message without incresing the ratchit

async function previewMsg(enc, chatID) {
  let remoteCount;
  let sharedKey;
  let msg;

  let data = await new Promise((resolve, reject) => {
    var request = indexedDB.open("User", 1);
    request.onsuccess = async function (e) {
      let db = e.target.result;
      let store = await db.transaction("keys", "readwrite").objectStore("keys");
      let req = await store.get(chatID);
      req.onsuccess = function (e) {
        remoteCount = e.target.result.remoteCount;
        sharedKey = e.target.result.sharedKey;
        //modified by 1
        let ratchetKey = deriveKey(sharedKey, remoteCount);
        msg = decrypt(enc, ratchetKey);
        console.log(decrypt(enc, ratchetKey));
        resolve(msg);
      };

      req.onerror = function (e) {
        console.log(e);
        reject(e);
      };
    };
    request.onerror = function (e) {
      reject(e);
    };
  });
  return data;
}

//endpoints for getting user friends info 
let endpoints = [];
contacts.forEach((contact) => {
  endpoints.push(`api/v1/messages/${contact.id}`);
});

// Get mesages without joining chat
axios.all(endpoints.map((endpoint) => axios.get(endpoint))).then((data) => {
  data.forEach((res) => {
    if (res.data.messages.length > 0) {
      let mesCou = 0;
      res.data.messages.forEach(async (message) => {
        if (message.sender._id != currentId) {
          let chat;
          for (var i = 0; i < contacts.length; i++) {
            if (contacts[i].id == message.chat) {
              chat = contacts[i];
              break;
            }
          }

          mesCou = chat.childNodes[5]?.innerText
            ? chat.childNodes[5].innerText
            : 0;
          let msge = await previewMsg(message.content, message.chat);
          chat.childNodes[3].childNodes[3].innerText = msge;
          mesCou++;
          if (!chat.childNodes[5]) {
            let b = document.createElement("b");
            b.classList.add("text-light", "bg-success");
            chat.appendChild(b);
          }
          chat.childNodes[5].innerText = mesCou;
          document.getElementById("chatList").prepend(chat);
        }
      });
    }
  });
});
