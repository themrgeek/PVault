import dotenv from "dotenv";
dotenv.config();
// We've to export this config object such that it can be used in other files. This config object will hold all the environment variables that we need to use in our application.

// What is the need of env.js?
// The env.js file is used to load environment variables from a .env file into process.env.

// What is process.env?
// process.env is a global object in Node.js that provides access to environment variables. It allows us to read and use environment variables defined in the system or in a .env file.

//  What is need of config object?
// The config object is used to store and organize the environment variables that we need to use in our application. It provides a centralized place to access these variables, making it easier to manage and update configuration settings for different environments (development, testing, production) without hardcoding them into our application code.

// what is use of dotenv package?
// The dotenv package is used to load environment variables from a .env file into process.env. It allows us to define environment-specific configuration settings in a separate file, making it easier to manage and switch between different environments without modifying the application code. By using dotenv, we can keep sensitive information (like database credentials, API keys, etc.) out of our source code and version control system, enhancing security and maintainability.

export const config = {
  port: process.env.PORT,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  nodeEnv: process.env.NODE_ENV,
};
// Fail fast if critical secrets are missing
const required = [
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "NODE_ENV",
];
required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
