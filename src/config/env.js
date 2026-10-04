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
  encryptionKey: process.env.ENCRYPTION_KEY,
};
// Fail fast if critical secrets are missing
const required = [
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "NODE_ENV",
  "ENCRYPTION_KEY",
];
required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
// what is the required array for?
// The required array is used to define a list of critical environment variables that must be present for the application to run correctly.
// It contains the names of the environment variables that are essential for the application's configuration and functionality. 
// By checking for the presence of these variables at startup, we can ensure that the application fails fast if any of them are missing, preventing runtime errors and misconfigurations.

// Validation of an encryption key:
// Validation of this key is important because it ensures that the key meets the required security standards and is suitable for use in cryptographic operations. An invalid or weak encryption key can compromise the security of sensitive data, making it vulnerable to attacks. By validating the encryption key, we can ensure that it has the correct length, format, and strength, which helps protect the confidentiality and integrity of the data being encrypted.

if (config.encryptionKey.length !== 64) {
  throw new Error(
    "Invalid encryption key length. Must be 64 characters (256 bits) long."
  );
}