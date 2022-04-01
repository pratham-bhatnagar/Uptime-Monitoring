const readline = require("readline");
const util = require("util");
var debug = util.debuglog("cli");
var events = require("events");

class _events extends events {}
var e = new _events();

var cli = {};

cli.init = function () {
  // send the start message
  console.log("\x1b[34m%s\x1b[0m", `CLI is Running`);
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  // Create a Prompt
  _interface.prompt();
};

module.exports = cli;
