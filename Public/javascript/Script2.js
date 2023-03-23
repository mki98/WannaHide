var user = document.querySelectorAll("#user");
var chatWin = document.getElementById("chatNav");
var chatBox =document.getElementById('chatBox')
var formMessage = document.getElementById('formMessage')
var menu = document.getElementById('menu');
var setting = document.getElementById('setting');
var profile = document.getElementById('profile');
var latestMessage ;
var time ;
var socket = io();


console.log(user);
for (var i = 0; i < user.length; i++) {
  user[i].addEventListener("click", function (e) {
    $("#ourChat").fadeIn(1000);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
$("#chatClick").click(function () {
  $("#chatHide").fadeToggle(1000 , function(){
    $("#profile").fadeOut(2000)
  });
  chatBox.scrollTop = chatBox.scrollHeight;
});
$("#contactClick").click(function () {
  $("#contactHide").fadeToggle(1000 , function(){
    $("#chatHide").toggleClass("full" ,function(){
      $("#profile").fadeOut(2000)
    });
  });
  chatBox.scrollTop = chatBox.scrollHeight;
  //   $("#chatHide").tog(1000);

});


let chatId = '';
$(".contact").click((e) => {
  console.log(e.target);
  chatId = e.target.id;
  //join clicked chat
  socket.emit('join',chatId)
  latestMessage=e.target.childNodes[3].childNodes[3].childNodes[1]
  time=e.target.childNodes[3].childNodes[1].children[1]
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
                      <p> ${data[i].content}<br> <span>${new Date(Date.parse(data[i].time)).toLocaleString("en-EG",{hour12:true,hour:"numeric",minute:"2-digit"})}</span></p>
                     </div>`;
    }
    chatBox.innerHTML=msgs
    chatBox.scrollTop = chatBox.scrollHeight;

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
  <p> ${msg}<br> <span>${new Date(Date.now()).toLocaleString("en-EG",{hour12:true,hour:"numeric",minute:"2-digit"})}</span></p>
 </div> `
  chatBox.innerHTML+=msgHtml
  chatBox.scrollTop = chatBox.scrollHeight;
  latestMessage.innerHTML =`<p>${msg}</p>` 
  time.innerText=`${new Date(Date.now()).toLocaleString("en-EG",{hour12:true,hour:"numeric",minute:"2-digit"})}`
  
  msg=''

})






$("#img-menu").click (function(){
  $("#menu").slideToggle(1000)
})


$("#setting").click (function(){
  $("#profile").fadeIn(500,function(){
    $("#contactHide").fadeOut(1000 , function(){
      $("#chatHide").fadeOut(1000)
    })
  })
})

$("#addClick").click (function(){
  $(".inputAdd").toggle(1000 );
})