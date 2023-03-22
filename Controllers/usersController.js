const AppError = require('../Utils/appError')
const { tryCatch } = require("../Utils/tryCatch");
const Users = require('../Models/userModel')

exports.getMe = tryCatch(async (req, res) => {
    if (!req.user) throw new AppError(404, "This user is not found");
    return res.status(200).json({ status: "Success", User: req.user });
  });

exports.getContacts=tryCatch(async (req,res)=>{
    let contacts = await Users.findById(req.user._id).select(' friends -_id')
    
    return res.status(200).json({status:'Success',contacts})    
}
)  

exports.addContact = tryCatch(async (req,res)=>{
    const friend = req.body.username
    const sender = req.user.username
    if(!(await Users.findOne({username:friend}))){
        return new AppError(404,"No user found")
    }
    res.status(200).json({status:"Success",message:`A friend request is sent to ${friend}`})
})