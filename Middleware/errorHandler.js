const AppError =require('../Utils/appError')

exports.errorHandler =  (error,req,res,next)=>{
    console.log(error)
    //App Errors 
    if(error instanceof AppError){
        return res.status(error.statusCode).json({
            errorCode: error.customCode,
            message: error.message
        })
    }
    //Not handled errors
    return res.status(500).json({status:"Error",message:"Something went wrong",devMessage:error})
}
