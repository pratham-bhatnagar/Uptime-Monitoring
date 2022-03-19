const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

var lib = {};

lib.baseDir = path.join(__dirname, "/../.data/");

lib.create = function (dir, file, data, callback) {
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    function (err, fileDiscriptor) {
      if (!err && fileDiscriptor) {
        stringData = JSON.stringify(data);
        fs.writeFile(fileDiscriptor, stringData, function (err) {
          if (!err) {
            fs.close(fileDiscriptor, function (err) {
              if (!err) {
                callback(false);
              } else {
                callback("Error Closing the file");
              }
            });
          } else {
            callback("Error in Writing the file ");
          }
        });
      } else {
        callback("Could not create a file, File may already exist.");
      }
    }
  );
};

lib.read = function (dir, file, callback) {
  fs.readFile(
    lib.baseDir + dir + "/" + file + ".json",
    "utf-8",
    function (err, data) {
      if (!err && data) {
        var parsedData = helpers.parseJsonToObject(data);
        callback(false, parsedData);
      } else {
        callback(err, data);
      }
    }
  );
};

lib.update = function (dir, file, data, callback) {
  // Open the file for writing
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    function (err, fileDescriptor) {
      if (!err && fileDescriptor) {
        // Convert data to string
        var stringData = JSON.stringify(data);

        // Truncate the file
        fs.truncate(fileDescriptor, function (err) {
          if (!err) {
            // Write to file and close it
            fs.writeFile(fileDescriptor, stringData, function (err) {
              if (!err) {
                fs.close(fileDescriptor, function (err) {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("Error closing existing file");
                  }
                });
              } else {
                callback("Error writing to existing file");
              }
            });
          } else {
            callback("Error truncating file");
          }
        });
      } else {
        callback("Could not open file for updating, it may not exist yet");
      }
    }
  );
};

lib.delete = function (dir, file, callback) {
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", function (err) {
    if (!err) {
      callback(false);
    } else {
      callback("Trouble Deleting the File");
    }
  });
};

// List all the items in a dir
lib.list = function (dir, callback) {
  fs.readdir(lib.baseDir + dir + "/", function (err, data) {
    if (!err && data && data.length > 0) {
      var trimmedFilesNames = [];
      data.forEach(function (fileName) {
        trimmedFilesNames.push(fileName.replace(".json", ""));
      });
      callback(false, trimmedFilesNames);
    } else {
      callback(err, data);
    }
  });
};

module.exports = lib;
