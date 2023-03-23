const mongoose = require("mongoose");

chatSchema = mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false,
  },
  groupInfo: [
    {
      groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
      groupImg: { type: String, default: "groupDef.png" },
      groupName: { type: String },

    },
  ],
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
  createdAt: { type: Date, default: Date.now() },
  latestMessage:{type:String},

},{timestamps:true});

module.exports = mongoose.model("Chats", chatSchema);
