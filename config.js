// Create and export config variables

const envirnments = {};

// Development default env
envirnments.development = {
  port: 3000,
  envName: "development",
};

// Production Envirnment
envirnments.production = {
  port: 5000,
  envName: "production",
};

// Determine which one is to be exported out
const currentEnv =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase
    : "";

// Checking which env to choose
const exportEnv = typeof (envirnments[currentEnv] == "object"
  ? envirnments[currentEnv]
  : envirnments.development);

module.exports = exportEnv;
