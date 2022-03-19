const dotenv = require("dotenv");
dotenv.config();

const envirnments = {};

// Development Envirnment
envirnments["development"] = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "development",
  hashingSecret: process.env.hashingSecret,
  maxChecks: 5,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNTSID,
    authToken: process.env.TWILIO_AUTHTOKEN,
    fromPhone: process.env.TWILIO_PHONENUMBER,
  },
};

// Production Envirnment
envirnments["production"] = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: process.env.hashingSecret,
  maxChecks: 5,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNTSID,
    authToken: process.env.TWILIO_AUTHTOKEN,
    fromPhone: process.env.TWILIO_PHONENUMBER,
  },
};

// Determine which one is to be exported out
if (envirnments[process.env.envName.toLowerCase()]) {
  var exportEnv = envirnments[process.env.envName];
} else {
  var exportEnv = envirnments["development"];
}

module.exports = exportEnv;
