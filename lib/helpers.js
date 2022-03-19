const cyrpto = require("crypto");
const config = require("./config");
const querystring = require("querystring");
const https = require("https");
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

helpers.createRandomString = function (strLength) {
  strLength = typeof strLength == "number" && strLength > 0 ? strLength : false;
  if (strLength) {
    var possibleCharacters = "abcdefghijklmnopqrstuvwxyz0123456789";
    var str = "";
    for (i = 1; i <= strLength; i++) {
      var randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length)
      );
      str += randomCharacter;
    }
    return str;
  } else {
    return false;
  }
};

helpers.sendTwilioSms = function (phone, message, callback) {
  const accountSid = config.twilio.accountSid;
  const authToken = config.twilio.authToken;
  const client = require("twilio")(accountSid, authToken);

  phone =
    typeof phone == "string" && phone.trim().length == 10
      ? phone.trim()
      : false;
  message =
    typeof message == "string" &&
    message.trim().length > 0 &&
    message.trim().length <= 1600
      ? message.trim()
      : false;

  if (phone && message) {
    client.messages
      .create({
        body: message,
        from: config.twilio.fromPhone,
        to: "+91" + phone,
      })
      .then((message) => {
        if (message.errorCode && message.errorMessage) {
          callback(message.errorCode, { Error: message.errorMessage });
        } else {
          callback(200, { Status: "Message Sent Successfully to " + phone });
        }
      });
  } else {
    callback(400, { Error: "Missing Required Field(s) or Invalid Feild(s)" });
  }
};

module.exports = helpers;
