const http = require("http");
const https = require("https");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");
const fs = require("fs");
const _data = require("./lib/data");
const handlers = require("./lib/handlers");

const hostname = "localhost";

// Create a http server
const httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

// start the Http server
httpServer.listen(config.httpPort, hostname, function () {
  console.log(
    `HTTP Server running at http://${hostname}:${config.httpPort} in ${config.envName} MODE`
  );
});

// Create a Https Server
// self assigned certificates might not work
var httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};

const httpsServer = https.createServer(httpsServerOptions, function (res, req) {
  unifiedServer(req, res);
});
// Start the Https Server
httpsServer.listen(config.httpsPort, hostname, function () {
  console.log(
    `HTTPS Server running at https://${hostname}:${config.httpsPort} in ${config.envName} MODE`
  );
});

// All the logic for both http and https server
var unifiedServer = function (req, res) {
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

    if (router[trimmed] != undefined) {
      var ChoosenHandler = router[trimmed];
    } else {
      var ChoosenHandler = router["notFound"];
    }

    const data = {
      path: trimmed,
      method: method,
      payload: payload,
      headers: headers,
      query: resQuery,
    };

    ChoosenHandler(data, function (statusCode, response) {
      statusCode = typeof statusCode === "number" ? statusCode : 404;
      response = typeof response === "object" ? response : { empty: "obj" };

      // Convert the response to a string
      const responseString = JSON.stringify(response);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(`${responseString}`);
      console.log(
        `Returning Status Code: ${statusCode} and Response: ${responseString}`
      );
    });
  });
};

const router = {
  "api/ping": handlers.ping,
  api: handlers.api,
  notFound: handlers.notFound,
};
