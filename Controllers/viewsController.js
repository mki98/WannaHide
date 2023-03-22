const { tryCatch } = require("../Utils/tryCatch");
const Chats = require("../Models/chatsModel");
const axios = require('axios')
exports.authUser = tryCatch((req, res) => {
  res.render("sign");
});
exports.index = tryCatch((req, res) => {
  res.render("index");
});

exports.chat = tryCatch(async(req, res) => {
    console.log('ur ',res.locals.user)
  if (!res.locals.user) {
    return res.redirect("/accounts");
  }
  const chats = await Chats.find({ users: res.locals.user._id }).populate('users');
  res.render("chat", { user: res.locals.user , chats:chats });
});


exports.ConfirmSingup=tryCatch(async(req,res)=>{
const {token}=req.params
 axios({
  method:'GET',
  url:`http://localhost:5000/api/v1/users/confirm/${token}`,
}).then((result)=>{console.log(result.data)
  res.render('confirm',{confRes:result.data})}).catch(err=>{
    console.log(err.response.data.message);
    res.render('confirm',{confRes:{message:`${err.response.data.message}`}})})

}

)