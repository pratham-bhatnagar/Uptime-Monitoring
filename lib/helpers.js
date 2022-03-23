const cyrpto = require("crypto");
const config = require("./config");
const querystring = require("querystring");
const https = require("https");
var path = require("path");
var fs = require("fs");

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

helpers.getTemplate = function (templateName, data, callback) {
  templateName =
    typeof templateName == "string" && templateName.length > 0
      ? templateName
      : false;
  data = typeof data == "object" && data !== null ? data : {};
  if (templateName) {
    var templatesDir = path.join(__dirname, "/../templates/");
    fs.readFile(
      templatesDir + templateName + ".html",
      "utf8",
      function (err, str) {
        if (!err && str && str.length > 0) {
          var finalString = helpers.replace(str, data);
          callback(false, finalString);
        } else {
          callback("No template could be found");
        }
      }
    );
  } else {
    callback("A valid template name was not specified");
  }
};

helpers.addUniversalTemplates = function (str, data, callback) {
  str = typeof str == "string" && str.length > 0 ? str : "";
  data = typeof data == "object" && data !== null ? data : {};
  helpers.getTemplate("_header", data, function (err, headerString) {
    if (!err && headerString) {
      helpers.getTemplate("_footer", data, function (err, footerString) {
        if (!err && headerString) {
          var fullString = headerString + str + footerString;
          callback(false, fullString);
        } else {
          callback("Could not find the footer template");
        }
      });
    } else {
      callback("Could not find the header template");
    }
  });
};

helpers.replace = function (str, data) {
  str = typeof str == "string" && str.length > 0 ? str : "";
  data = typeof data == "object" && data !== null ? data : {};
  for (var keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data["global." + keyName] = config.templateGlobals[keyName];
    }
  }
  for (var key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key] == "string")) {
      var replace = data[key];
      var find = "{" + key + "}";
      str = str.replace(find, replace);
    }
  }
  return str;
};

helpers.getStaticAsset = function (fileName, callback) {
  fileName =
    typeof fileName == "string" && fileName.length > 0 ? fileName : false;
  if (fileName) {
    var publicDir = path.join(__dirname, "/../public/");
    fs.readFile(publicDir + fileName, function (err, data) {
      if (!err && data) {
        callback(false, data);
      } else {
        callback("No file could be found");
      }
    });
  } else {
    callback("A valid file name was not specified");
  }
};

module.exports = helpers;
