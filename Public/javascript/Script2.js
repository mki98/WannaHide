var user = document.querySelectorAll("#user");
var chatWin = document.getElementById("chatNav");
var chatBox =document.getElementById('chatBox')
var formMessage = document.getElementById('formMessage')

var socket = io();

console.log(user);
for (var i = 0; i < user.length; i++) {
  user[i].addEventListener("click", function (e) {
    $("#ourChat").fadeIn(1000);
  });
}
$("#chatClick").click(function () {
  $("#chatHide").slideToggle(1000);
});
$("#contactClick").click(function () {
  $("#contactHide").fadeToggle(1000);
  //   $("#chatHide").tog(1000);

  $("#chat-id").toggleClass("full");
});

$("#setting").click(function () {
  $("#sitt").fadeToggle(1000);
});
let chatId = '';
$(".contact").click((e) => {
  console.log(e.target.childNodes[3].childNodes[1].firstElementChild.innerText);
  
  chatId = e.target.id;
  //join clicked chat
  socket.emit('join',chatId)

  chatWin.innerHTML = ` <div class="img-user position-relative">
                                           ${e.target.childNodes[1].childNodes[1].outerHTML}
                                        </div>
                                        <div class="pt-2">
                                            <h4>${e.target.childNodes[3].childNodes[1].firstElementChild.innerText} <br> <span>online</span></h4>
                                        </div>`;

  axios({
    method: "GET",
    url: `/api/v1/messages/${chatId}`,
  }).then((res) => {
    var msgs = "";
    console.log(res);
    var data = res.data.messages;
    for (let i = 0; i < data.length; i++) {
      msgs += `<div class="massage ${ data[i].sender.username == e.target.childNodes[3].childNodes[1].firstElementChild.innerText? 'friendMassage': 'myMassage'}">
                      <p> ${data[i].content}<br> <span>${data[i].time}</span></p>
                     </div>`;
    }
    chatBox.innerHTML=msgs

  });

  $("#chatHide").fadeIn(1000);
});
let currentId='';
if(formMessage){
  formMessage.addEventListener('submit',(e)=>{
    e.preventDefault()
    currentId= e.target[0].attributes.sender.value
    console.log(currentId)
   let content = e.target[0].value
   if(content){
    socket.emit('chat msg',content,chatId,currentId)
    e.target[0].value=''
    axios({
      method: "POST",
      url: `/api/v1/messages`,
      
      data:{
          content,
          chat:chatId
      }
      }).then(res=> {console.log(res)})
   }
  })
}
socket.on('chatMsg', (msg,chatId,senderId)=>{
  console.log(msg,chatId,senderId)     
  var msgHtml = ` <div class="massage ${senderId==currentId? 'myMassage':'friendMassage'} ">
  <p> ${msg}<br> <span>9:48</span></p>
 </div> `
  chatBox.innerHTML+=msgHtml

  
  msg=''

})