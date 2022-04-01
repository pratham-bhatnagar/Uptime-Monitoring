const server = require("./lib/server");
const workers = require("./lib/workers");
const cli = require("./lib/cli");

const app = {};

app.init = function () {
  server.init();
  workers.init();

  setTimeout(function () {
    cli.init();
  }, 50);
};
app.init();
module.exports = app;
