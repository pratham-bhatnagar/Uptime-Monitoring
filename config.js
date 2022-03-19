const dotenv = require("dotenv");
dotenv.config();

const envirnments = {};
// @TODO - Put hashing secret in an .envfile

// Development Envirnment
envirnments["development"] = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "development",
  hashingSecret: process.env.hashingSecret,
  maxChecks: 5,
};

// Production Envirnment
envirnments["production"] = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: process.env.hashingSecret,
  maxChecks: 5,
};

// Determine which one is to be exported out
if (envirnments[process.env.envName.toLowerCase()]) {
  var exportEnv = envirnments[process.env.envName];
} else {
  var exportEnv = envirnments["development"];
}

module.exports = exportEnv;
