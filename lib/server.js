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

const hostname = "uptime-monitoring-five.vercel.app";

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
    var chosenHandler =
      typeof server.router[trimmed] !== "undefined"
        ? server.router[trimmed]
        : handlers.notFound;

    chosenHandler =
      trimmed.indexOf("public/") > -1 ? handlers.public : chosenHandler;

    const data = {
      path: trimmed,
      method: method,
      payload: helpers.parseJsonToObject(payload),
      headers: headers,
      query: resQuery,
    };

    chosenHandler(data, function (statusCode, response, contentType) {
      contentType = typeof contentType == "string" ? contentType : "json";
      statusCode = typeof statusCode == "number" ? statusCode : 500;

      var responseString = "";
      // Return the response

      if (contentType === "json") {
        res.setHeader("Content-Type", "application/json");
        response = typeof response == "object" ? response : {};
        responseString = JSON.stringify(response);
      }

      if (contentType === "html") {
        res.setHeader("Content-Type", "text/html");
        responseString = typeof response == "string" ? response : "";
      }
      if (contentType == "json") {
        res.setHeader("Content-Type", "application/json");
        payload = typeof response == "object" ? response : {};
        responseString = JSON.stringify(payload);
      }

      if (contentType == "html") {
        res.setHeader("Content-Type", "text/html");
        responseString = typeof response == "string" ? response : "";
      }

      if (contentType == "favicon") {
        res.setHeader("Content-Type", "image/x-icon");
        responseString = typeof response !== "undefined" ? response : "";
      }

      if (contentType == "plain") {
        res.setHeader("Content-Type", "text/plain");
        responseString = typeof response !== "undefined" ? response : "";
      }

      if (contentType == "css") {
        res.setHeader("Content-Type", "text/css");
        responseString = typeof response !== "undefined" ? response : "";
      }

      if (contentType == "png") {
        res.setHeader("Content-Type", "image/png");
        responseString = typeof response !== "undefined" ? response : "";
      }

      if (contentType == "jpg") {
        res.setHeader("Content-Type", "image/jpeg");
        responseString = typeof response !== "undefined" ? response : "";
      }

      res.writeHead(statusCode);
      res.end(responseString);

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
  "": handlers.index,
  "account/create": handlers.accountCreate,
  "account/edit": handlers.accountEdit,
  "account/deleted": handlers.accountDeleted,
  "session/create": handlers.sessionCreate,
  "session/deleted": handlers.sessionDeleted,
  "checks/all": handlers.checksList,
  "checks/create": handlers.checksCreate,
  "checks/edit": handlers.checksEdit,
  ping: handlers.ping,
  "api/checks": handlers.checks,
  "api/users": handlers.users,
  "api/notFound": handlers.notFound,
  "api/tokens": handlers.tokens,
  "favicon.ico": handlers.favicon,
  public: handlers.public,
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
