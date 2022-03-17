// Create and export config variables

const envirnments = {};

// Development Envirnment
envirnments["development"] = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: "development",
};

// Production Envirnment
envirnments["production"] = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: "production",
};

// Determine which one is to be exported out
if (envirnments[process.env.NODE_ENV.toLowerCase()]) {
  var exportEnv = envirnments[process.env.NODE_ENV];
} else {
  var exportEnv = envirnments["development"];
}

module.exports = exportEnv;
