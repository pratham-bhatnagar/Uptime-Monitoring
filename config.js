// Create and export config variables

const envirnments = {};

// Development Envirnment
envirnments["development"] = {
  port: 3000,
  envName: "development",
};

// Testing Envirnment
envirnments["testing"] = {
  port: 8080,
  envName: "testing",
};

// Production Envirnment
envirnments["production"] = {
  port: 5000,
  envName: "production",
};

// Determine which one is to be exported out
if (envirnments[process.env.NODE_ENV.toLowerCase()]) {
  var exportEnv = envirnments[process.env.NODE_ENV];
} else {
  var exportEnv = envirnments["development"];
}

module.exports = exportEnv;
