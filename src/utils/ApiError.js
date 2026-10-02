export class ApiError extends Error {
  constructor(statusCode, message, type = 'about:blank') {
    super(message); // super() calls the constructor of the parent class (Error) with the provided message. This sets the error message for the ApiError instance. 
    // which message will be displayed when super() is called? The message passed to the constructor of ApiError will be displayed when super() is called. This message is set as the error message for the ApiError instance.
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor); // Error.captureStackTrace is a method that creates a stack trace for the error instance. It helps in debugging by providing information about where the error occurred in the code. The second argument (this.constructor) ensures that the stack trace starts from the point where the ApiError was instantiated, rather than including the constructor itself in the trace.
  }
}