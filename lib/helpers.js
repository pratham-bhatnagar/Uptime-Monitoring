const cyrpto = require("crypto");
const config = require("./../config");
const helpers = {};

helpers.hash = function (str) {
  if (typeof str == "string" && str.trim().length > 0) {
    var hash = cyrpto
      .createHmac("sha256", config.hashingSecret)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

helpers.parseJsonToObject = function (str) {
  try {
    var obj = JSON.parse(str);
    return obj;
  } catch (err) {
    return {};
  }
};

module.exports = helpers;
