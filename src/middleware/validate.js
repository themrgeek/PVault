import { ApiError } from '../utils/ApiError.js';

export function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message);
      return next(new ApiError(400, messages.join(', ')));
    }
    next(); // what does next() do in this context? The next() function is a callback that passes control to the next middleware function in the stack. In this context, it is called when the validation passes (i.e., there are no errors), allowing the request to proceed to the next middleware or route handler.
  };
}