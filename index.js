const http = require("http");
const url = require("url");
const stringDecoder = require("string_decoder").StringDecoder;

const hostname = "127.0.0.1";
const port = "3000";

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
    const choosenHandler =
      typeof router[trimmed] !== undefined
        ? router[trimmed]
        : handlers.notFound;

    // choose the data object
    const data = {
      path: trimmed,
      method: method,
      payload: payload,
      headers: headers,
      query: resQuery,
    };

    choosenHandler(data, function (statusCode, response) {
      statusCode = typeof statusCode === "number" ? statusCode : 200;
      response = typeof response === "object" ? response : {};

      const responseString = JSON.stringify(response);
      res.writeHead(statusCode);
      res.end(`${responseString}`);
      console.log(`returning response ${statusCode} and ${responseString}`);
    });
  });
});
// start the server
server.listen(port, hostname, () => {
  console.log(`server running at http://${hostname}/${port}`);
});

// define a handler
const handlers = {};

// samplle handlers
handlers.sample = (data, callback) => {
  // http status code , and a response
  callback(406, { name: "sample handler" });
};

// not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Define a request router
const router = {
  sample: handlers.sample,
};
