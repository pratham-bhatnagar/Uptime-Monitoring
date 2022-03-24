const dotenv = require("dotenv");
dotenv.config();

const envirnments = {};

// Development Envirnment
envirnments["development"] = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "development",
  hashingSecret: process.env.HASHING_SECRET,
  maxChecks: 5,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNTSID,
    authToken: process.env.TWILIO_AUTHTOKEN,
    fromPhone: process.env.TWILIO_PHONENUMBER,
  },
  templateGlobals: {
    appName: "UptimeChecker",
    companyName: "Pratham Bhatnagar",
    yearCreated: "2022",
    baseUrl: "https://uptime-monitoring-made-easy.herokuapp.com/",
  },
};

// Production Envirnment
envirnments["production"] = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
  hashingSecret: process.env.HASHING_SECRET,
  maxChecks: 5,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNTSID,
    authToken: process.env.TWILIO_AUTHTOKEN,
    fromPhone: process.env.TWILIO_PHONENUMBER,
  },
  templateGlobals: {
    appName: "UptimeChecker",
    companyName: "Pratham Bhatnagar",
    yearCreated: "2022",
  },
};

// Determine which one is to be exported out
if (envirnments[process.env.NODE_ENV.toLowerCase()]) {
  var exportEnv = envirnments[process.env.NODE_ENV];
} else {
  var exportEnv = envirnments["development"];
}

module.exports = exportEnv;
