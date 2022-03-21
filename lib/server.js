const http = require("http");
const https = require("https");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;
const fs = require("fs");
const path = require("path");
const config = require("./config");
const handlers = require("./handlers");
const helpers = require("./helpers");
var util = require("util");
var debug = util.debuglog("server");

const hostname = "localhost";

const server = {};

// Create a http server
server.httpServer = http.createServer(function (req, res) {
  server.unifiedServer(req, res);
});

// Create a Https Server
// self assigned certificates might not work
server.httpsServerOptions = {
  key: fs.readFileSync(path.join(__dirname, "/../https/key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "/../https/cert.pem")),
};

server.httpsServer = https.createServer(
  server.httpsServerOptions,
  function (res, req) {
    server.unifiedServer(req, res);
  }
);

// All the logic for both http and https server
server.unifiedServer = function (req, res) {
  const parsed = url.parse(req.url, true);
  const path = parsed.pathname;
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const resQuery = parsed.query;
  const headers = req.headers;
  const decoder = new stringDecoder("utf-8");
  payload = "";
  req.on("data", (data) => {
    payload += decoder.write(data);
  });
  req.on("end", () => {
    payload += decoder.end();
    if (server.router[trimmed] != undefined) {
      var ChoosenHandler = server.router[trimmed];
    } else {
      var ChoosenHandler = server.router["notFound"];
    }

    const data = {
      path: trimmed,
      method: method,
      payload: helpers.parseJsonToObject(payload),
      headers: headers,
      query: resQuery,
    };

    ChoosenHandler(data, function (statusCode, response) {
      statusCode = typeof statusCode === "number" ? statusCode : 500;
      response = typeof response === "object" ? response : { empty: "obj" };

      // Convert the response to a string
      const responseString = JSON.stringify(response);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(`${responseString}`);
      if (statusCode == 200) {
        debug(
          "\x1b[32m%s\x1b[0m",
          method.toUpperCase() + " /" + trimmed + " " + statusCode
        );
      } else {
        debug(
          "\x1b[31m%s\x1b[0m",
          method.toUpperCase() + " /" + trimmed + " " + statusCode
        );
      }
    });
  });
};

server.router = {
  checks: handlers.checks,
  users: handlers.users,
  ping: handlers.ping,
  notFound: handlers.notFound,
  tokens: handlers.tokens,
};

server.init = function () {
  // start the Http server
  server.httpServer.listen(config.httpPort, hostname, function () {
    console.log(
      "\x1b[35m%s\x1b[0m",
      `HTTP Server running at http://${hostname}:${config.httpPort} in ${config.envName} MODE`
    );
  });

  // Start the Https Server
  server.httpsServer.listen(config.httpsPort, hostname, function () {
    console.log(
      "\x1b[36m%s\x1b[0m",
      `HTTPS Server running at https://${hostname}:${config.httpsPort} in ${config.envName} MODE`
    );
  });
};

module.exports = server;
