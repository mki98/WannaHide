const mongoose = require('mongoose')




messagesSchema = mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId, ref:'Users', required: true},
    content:{type:String, required: true},
    chat:{type:mongoose.Schema.Types.ObjectId,ref:'Chats', required: true},
    time:{type:Date,default: Date.now()}
})
module.exports = mongoose.model('Messages',messagesSchema)