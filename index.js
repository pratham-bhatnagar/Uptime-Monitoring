const http = require("http");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;
const config = require("./config");

const hostname = "127.0.0.1";

const server = http.createServer(function (req, res) {
  // Parsing the url
  const parsed = url.parse(req.url, true);

  // getting the pathname
  const path = parsed.pathname;

  // removing extra slashes
  const trimmed = path.replace(/^\/+|\/+$/g, "");

  // getting the method of req
  const method = req.method.toLowerCase();

  // Getting the query for req
  const resQuery = parsed.query;

  // getting the headers
  const headers = req.headers;

  // Get the payloads, if any
  const decoder = new stringDecoder("utf-8");
  payload = "";
  req.on("data", (data) => {
    payload += decoder.write(data);
  });
  req.on("end", () => {
    payload += decoder.end();

    // choose the handler
    if (router[trimmed] != undefined) {
      var ChoosenHandler = router[trimmed];
    } else {
      var ChoosenHandler = router["notFound"];
    }

    // choose the data object, This is the data that needs to be sent to thr handler
    const data = {
      path: trimmed,
      method: method,
      payload: payload,
      headers: headers,
      query: resQuery,
    };

    ChoosenHandler(data, function (statusCode, response) {
      // Setting up a default status code, if handler does'nt respond with any status code
      statusCode = typeof statusCode === "number" ? statusCode : 200;

      // Setting up a default Response
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
});
// start the server
server.listen(3000, hostname, function () {
  console.log(
    `server running at http://${hostname}/${config.port} in ${config.envName} mode`
  );
});

// define a handlers
const handlers = {};

// sample handlers
handlers.api = function (data, callback) {
  // callback a http status code and a payload
  callback(406, { name: "sample API" });
};

// not found handler
handlers.notFound = function (data, callback) {
  callback(404);
};

// Define a request router
const router = {
  api: handlers.api,
  notFound: handlers.notFound,
};
