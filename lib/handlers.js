const handlers = {};

handlers.users = function (data, callback) {
  const methods = ["get", "post", "put", "delete"];
  if (methods.includes(data.methods)) {
    handlers._users[data.methods](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};

handlers._users.post = function (data, callback) {};
handlers._users.get = function (data, callback) {};
handlers._users.put = function (data, callback) {};
handlers._users.delete = function (data, callback) {};

handlers.ping = function (data, callback) {
  callback(200);
};

handlers.api = function (data, callback) {
  callback(406, { name: "sample API" });
};

handlers.notFound = function (data, callback) {
  callback(404);
};

module.exports = handlers;
