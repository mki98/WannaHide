class AppError extends Error {
  constructor(statusCode, message, customCode) {
    super(message);
    //HTTP RES CODE
    this.statusCode = statusCode;
    //IN APP ERROR CODE (INVALID_SUB)
    this.customCode = customCode;
  }
}
module.exports = AppError;
