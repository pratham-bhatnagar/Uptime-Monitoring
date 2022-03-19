const server = require("./lib/server");
const workers = require("./lib/workers");

const app = {};

app.init = function () {
  server.init();
  workers.init();
};
app.init();
module.exports = app;
