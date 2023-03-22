var  menuClick = document.querySelectorAll('.menuClick');
var menu = document.getElementById('menu');
var contacts =  document.querySelectorAll('[name="contacts"]')
var chatWin = document.getElementById('chatNav')

var socket = io();


// contacts.forEach(element => {
//     element.addEventListener('click',(e)=>{
//         let chatId = e.target.id
//         // console.log(e)
        
//         // chatWin.innerHTML= ` <div class="img-user position-relative">
//         //                                     <img src="../img/download (2).jpeg" alt="background" class="cover">
//         //                                 </div>
//         //                                 <div class="pt-2">
//         //                                     <h4>${e.target.firstChild?.data} <br> <span>online</span></h4>
//         //                                 </div>`
//     axios({
//         method: "GET",
//         url: `/api/v1/messages/${chatId}`,

//     }).then((res)=>{
//         var msgs = "";
//         console.log(res)
//         var data = res.data.messages
//         for(let i=0 ;i<data.length;i++){
//             msgs+= ` <div class="chat-box">
//             <div class="massage <% if (${data[i].sender._id} == locals.user._id) { %> myMassage <% } else{%>  friendMassage<% } %>">
//                 <p> ${data[i].content}<br> <span>9:48</span></p>
//             </div>`
//         }
        
//     })
//     })
    
// });





for(var i=0 ; i<menuClick.length ; i++){
    menuClick[i].addEventListener('click' , function(){
        menu.classList.toggle('openmenu');
    })
    
}
