var readline = require("readline");
var util = require("util");
var debug = util.debuglog("cli");
var events = require("events");
class _events extends events {}
var e = new _events();
var os = require("os");
var v8 = require("v8");
var _data = require("./data");
var _logs = require("./logs");
var helpers = require("./helpers");

var cli = {};

e.on("help", function (str) {
  cli.responders.help();
});

e.on("exit", function (str) {
  cli.responders.exit();
});

e.on("stats", function (str) {
  cli.responders.stats();
});

e.on("list users", function (str) {
  cli.responders.listUsers();
});

e.on("more user info", function (str) {
  cli.responders.moreUserInfo(str);
});

e.on("list checks", function (str) {
  cli.responders.listChecks(str);
});

e.on("more check info", function (str) {
  cli.responders.moreCheckInfo(str);
});

e.on("list logs", function (str) {
  cli.responders.listLogs();
});

e.on("more log info", function (str) {
  cli.responders.moreLogInfo(str);
});

// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = function () {
  // Codify the commands and their explanations
  var commands = {
    exit: "Kill the CLI (and the rest of the application)",
    help: "Show this help page",
    stats:
      "Get statistics on the underlying operating system and resource utilization",
    "List users":
      "Show a list of all the registered (undeleted) users in the system",
    "More user info --{userId}": "Show details of a specified user",
    "List checks --up --down":
      'Show a list of all the active checks in the system, including their state. The "--up" and "--down flags are both optional."',
    "More check info --{checkId}": "Show details of a specified check",
    "List logs":
      "Show a list of all the log files available to be read (compressed and uncompressed)",
    "More log info --{logFileName}": "Show details of a specified log file",
  };
  cli.horizontalLine();
  cli.centered("CLI MANUAL");
  cli.horizontalLine();
  cli.verticalSpace(2);
  for (var key in commands) {
    if (commands.hasOwnProperty(key)) {
      var value = commands[key];
      var line = "      \x1b[33m " + key + "      \x1b[0m";
      var padding = 60 - line.length;
      for (i = 0; i < padding; i++) {
        line += " ";
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }
  cli.verticalSpace(1);
  cli.horizontalLine();
};

cli.verticalSpace = function (lines) {
  lines = typeof lines == "number" && lines > 0 ? lines : 1;
  for (i = 0; i < lines; i++) {
    console.log("");
  }
};

cli.horizontalLine = function () {
  var width = process.stdout.columns;
  var line = "";
  for (i = 0; i < width; i++) {
    line += "-";
  }
  console.log(line);
};

cli.centered = function (str) {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : "";
  var width = process.stdout.columns;
  var leftPadding = Math.floor((width - str.length) / 2);
  var line = "";
  for (i = 0; i < leftPadding; i++) {
    line += " ";
  }
  line += str;
  console.log(line);
};

cli.responders.exit = function () {
  process.exit(0);
};

cli.responders.stats = function () {
  var stats = {
    "Load Average": os.loadavg().join(" "),
    "CPU Count": os.cpus().length,
    "Free Memory": os.freemem(),
    "Current Malloced Memory": v8.getHeapStatistics().malloced_memory,
    "Peak Malloced Memory": v8.getHeapStatistics().peak_malloced_memory,
    "Allocated Heap Used (%)": Math.round(
      (v8.getHeapStatistics().used_heap_size /
        v8.getHeapStatistics().total_heap_size) *
        100
    ),
    "Available Heap Allocated (%)": Math.round(
      (v8.getHeapStatistics().total_heap_size /
        v8.getHeapStatistics().heap_size_limit) *
        100
    ),
    Uptime: os.uptime() + " Seconds",
  };

  cli.horizontalLine();
  cli.centered("SYSTEM STATISTICS");
  cli.horizontalLine();
  cli.verticalSpace(2);
  for (var key in stats) {
    if (stats.hasOwnProperty(key)) {
      var value = stats[key];
      var line = "      \x1b[33m " + key + "      \x1b[0m";
      var padding = 60 - line.length;
      for (i = 0; i < padding; i++) {
        line += " ";
      }
      line += value;
      console.log(line);
      cli.verticalSpace();
    }
  }
  cli.verticalSpace();
  cli.horizontalLine();
};

cli.responders.listUsers = function () {
  _data.list("users", function (err, userIds) {
    if (!err && userIds && userIds.length > 0) {
      cli.verticalSpace();
      userIds.forEach(function (userId) {
        _data.read("users", userId, function (err, userData) {
          if (!err && userData) {
            var line =
              "Name: " +
              userData.firstName +
              " " +
              userData.lastName +
              " Phone: " +
              userData.phone +
              " Checks: ";
            var numberOfChecks =
              typeof userData.checks == "object" &&
              userData.checks instanceof Array &&
              userData.checks.length > 0
                ? userData.checks.length
                : 0;
            line += numberOfChecks;
            console.log(line);
            cli.verticalSpace();
          }
        });
      });
    }
  });
};

cli.responders.moreUserInfo = function (str) {
  var arr = str.split("--");
  var userId =
    typeof arr[1] == "string" && arr[1].trim().length > 0
      ? arr[1].trim()
      : false;
  if (userId) {
    _data.read("users", userId, function (err, userData) {
      if (!err && userData) {
        delete userData.hashedPassword;
        cli.verticalSpace();
        console.dir(userData, { colors: true });
        cli.verticalSpace();
      }
    });
  }
};

cli.responders.listChecks = function (str) {
  _data.list("checks", function (err, checkIds) {
    if (!err && checkIds && checkIds.length > 0) {
      cli.verticalSpace();
      checkIds.forEach(function (checkId) {
        _data.read("checks", checkId, function (err, checkData) {
          if (!err && checkData) {
            var includeCheck = false;
            var lowerString = str.toLowerCase();

            var state =
              typeof checkData.state == "string" ? checkData.state : "down";

            var stateOrUnknown =
              typeof checkData.state == "string" ? checkData.state : "unknown";
            if (
              lowerString.indexOf("--" + state) > -1 ||
              (lowerString.indexOf("--down") == -1 &&
                lowerString.indexOf("--up") == -1)
            ) {
              var line =
                "ID: " +
                checkData.id +
                " " +
                checkData.method.toUpperCase() +
                " " +
                checkData.protocol +
                "://" +
                checkData.url +
                " State: " +
                stateOrUnknown;
              console.log(line);
              cli.verticalSpace();
            }
          }
        });
      });
    }
  });
};

cli.responders.moreCheckInfo = function (str) {
  var arr = str.split("--");
  var checkId =
    typeof arr[1] == "string" && arr[1].trim().length > 0
      ? arr[1].trim()
      : false;
  if (checkId) {
    _data.read("checks", checkId, function (err, checkData) {
      if (!err && checkData) {
        cli.verticalSpace();
        console.dir(checkData, { colors: true });
        cli.verticalSpace();
      }
    });
  }
};

cli.responders.listLogs = function () {
  _logs.list(true, function (err, logFileNames) {
    if (!err && logFileNames && logFileNames.length > 0) {
      cli.verticalSpace();
      logFileNames.forEach(function (logFileName) {
        if (logFileName.indexOf("-") > -1) {
          console.log(logFileName);
          cli.verticalSpace();
        }
      });
    }
  });
};

cli.responders.moreLogInfo = function (str) {
  var arr = str.split("--");
  var logFileName =
    typeof arr[1] == "string" && arr[1].trim().length > 0
      ? arr[1].trim()
      : false;
  if (logFileName) {
    cli.verticalSpace();
    _logs.decompress(logFileName, function (err, strData) {
      if (!err && strData) {
        var arr = strData.split("\n");
        arr.forEach(function (jsonString) {
          var logObject = helpers.parseJsonToObject(jsonString);
          if (logObject && JSON.stringify(logObject) !== "{}") {
            console.dir(logObject, { colors: true });
            cli.verticalSpace();
          }
        });
      }
    });
  }
};

cli.processInput = function (str) {
  str = typeof str == "string" && str.trim().length > 0 ? str.trim() : false;
  if (str) {
    var uniqueInputs = [
      "help",
      "exit",
      "stats",
      "list users",
      "more user info",
      "list checks",
      "more check info",
      "list logs",
      "more log info",
    ];

    var matchFound = false;
    var counter = 0;
    uniqueInputs.some(function (input) {
      if (str.toLowerCase().indexOf(input) > -1) {
        matchFound = true;
        e.emit(input, str);
        return true;
      }
    });

    if (!matchFound) {
      console.log("Sorry, try again");
    }
  }
};

cli.init = function () {
  console.log("\x1b[34m%s\x1b[0m", "The CLI is running");

  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });
  _interface.prompt();

  _interface.on("line", function (str) {
    cli.processInput(str);
    _interface.prompt();
  });
  _interface.on("close", function () {
    process.exit(0);
  });
};

module.exports = cli;
