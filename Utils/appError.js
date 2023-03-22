class AppError extends Error {
    constructor(statusCode,message,customCode){
        //Message is avalible in the parent class
        super(message);
        //Not avalible params
        //HTTP RES CODE
        this.statusCode = statusCode;
        //IN APP ERROR CODE (INVALID_SUB)
        this.customCode = customCode;
    }
}
module.exports = AppError;