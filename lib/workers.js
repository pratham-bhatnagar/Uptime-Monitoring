const fs = require("fs");
const https = require("https");
const http = require("http");
var url = require("url");
const _data = require("./data");
const path = require("path");
var helpers = require("./helpers");

const workers = {};

workers.init = function () {
  // Execute all the checks
  workers.gatherAllChecks();

  // Call the loop so to Execute the checks again
  workers.loop();
};

module.exports = workers;
