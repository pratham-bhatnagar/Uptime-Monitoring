var fs = require("fs");
var https = require("https");
var http = require("http");
var url = require("url");
var path = require("path");
var _data = require("./data");
var helpers = require("./helpers");

var workers = {};

workers.gatherAllChecks = function () {
  _data.list("checks", function (err, checks) {
    if (!err && checks && checks.length > 0) {
      checks.forEach(function (check) {
        _data.read("checks", check, function (err, originalCheckData) {
          if (!err && originalCheckData) {
            workers.validateCheckData(originalCheckData);
          } else {
            console.log("Error in reading one of the check's data: ", err);
          }
        });
      });
    } else {
      console.log("Error: Could not find any checks to process");
    }
  });
};

workers.validateCheckData = function (originalCheckData) {
  originalCheckData =
    typeof originalCheckData == "object" && originalCheckData !== null
      ? originalCheckData
      : {};
  originalCheckData.id =
    typeof originalCheckData.id == "string" &&
    originalCheckData.id.trim().length == 20
      ? originalCheckData.id.trim()
      : false;
  originalCheckData.userPhone =
    typeof originalCheckData.userPhone == "string" &&
    originalCheckData.userPhone.trim().length == 10
      ? originalCheckData.userPhone.trim()
      : false;
  originalCheckData.protocol =
    typeof originalCheckData.protocol == "string" &&
    ["http", "https"].indexOf(originalCheckData.protocol) > -1
      ? originalCheckData.protocol
      : false;
  originalCheckData.url =
    typeof originalCheckData.url == "string" &&
    originalCheckData.url.trim().length > 0
      ? originalCheckData.url.trim()
      : false;
  originalCheckData.method =
    typeof originalCheckData.method == "string" &&
    ["post", "get", "put", "delete"].indexOf(originalCheckData.method) > -1
      ? originalCheckData.method
      : false;
  originalCheckData.successCodes =
    typeof originalCheckData.successCodes == "object" &&
    originalCheckData.successCodes instanceof Array &&
    originalCheckData.successCodes.length > 0
      ? originalCheckData.successCodes
      : false;
  originalCheckData.timeoutSeconds =
    typeof originalCheckData.timeoutSeconds == "number" &&
    originalCheckData.timeoutSeconds % 1 === 0 &&
    originalCheckData.timeoutSeconds >= 1 &&
    originalCheckData.timeoutSeconds <= 5
      ? originalCheckData.timeoutSeconds
      : false;

  // Setting up the keys, If the check is never processed by Workers
  originalCheckData.state =
    typeof originalCheckData.state == "string" &&
    ["up", "down"].indexOf(originalCheckData.state) > -1
      ? originalCheckData.state
      : "down";
  originalCheckData.lastChecked =
    typeof originalCheckData.lastChecked == "number" &&
    originalCheckData.lastChecked > 0
      ? originalCheckData.lastChecked
      : false;

  // Validating all the check data
  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds
  ) {
    workers.performCheck(originalCheckData);
  } else {
    console.log(
      "Error: " + originalCheckData.id + " is not properly formatted. Skipping."
    );
  }
};

workers.performCheck = function (originalCheckData) {
  var checkOutcome = {
    error: false,
    responseCode: false,
  };

  var outcomeSent = false;

  var parsedUrl = url.parse(
    originalCheckData.protocol + "://" + originalCheckData.url,
    true
  );
  var hostName = parsedUrl.hostname;
  var path = parsedUrl.path;

  // Construct the request
  var requestDetails = {
    protocol: originalCheckData.protocol + ":",
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000, // Because we need it in milisecounds
  };

  var _moduleToUse = originalCheckData.protocol == "http" ? http : https;
  var req = _moduleToUse.request(requestDetails, function (res) {
    var status = res.statusCode;

    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("error", function (err) {
    checkOutcome.error = { error: true, value: err };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("timeout", function () {
    checkOutcome.error = { error: true, value: "timeout" };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  req.end();
};

workers.processCheckOutcome = function (originalCheckData, checkOutcome) {
  // Decide if the check is considered up or down
  var state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  var alertWarranted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  var newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  _data.update("checks", newCheckData.id, newCheckData, function (err) {
    if (!err) {
      if (alertWarranted) {
        workers.alertUserToStatusChange(newCheckData);
      } else {
        console.log("No changes in CheckID:" + newCheckData.id);
      }
    } else {
      console.log("Error trying to save updates to CheckID:" + newCheckData.id);
    }
  });
};

workers.alertUserToStatusChange = function (newCheckData) {
  var msg =
    "Alert: Your check for " +
    newCheckData.method.toUpperCase() +
    " " +
    newCheckData.protocol +
    "://" +
    newCheckData.url +
    " is now " +
    newCheckData.state.toUpperCase();
  helpers.sendTwilioSms(newCheckData.userPhone, msg, function (err) {
    if (err == 200 || !err || err == 201) {
      console.log(
        "Success:" +
          newCheckData.userPhone +
          " was alerted to a status change in their check, via sms: ",
        msg
      );
    } else {
      console.log(
        "Error: Could not send sms alert to " +
          newCheckData.userPhone +
          " on the CheckID:" +
          newCheckData.id,
        err
      );
    }
  });
};

workers.loop = function () {
  setInterval(function () {
    workers.gatherAllChecks();
  }, 1000 * 60);
};

// Init script
workers.init = function () {
  workers.gatherAllChecks();
  workers.loop();
};

module.exports = workers;
