const http = require("http");
const url = require("url");

const server = http.createServer(function (req, res) {
  const parsed = url.parse(req.url, true);

  const path = parsed.pathname;
  const trimmed = path.replace(/^\/+|\/+$/g, "");
  console.log(`trimmed: ${trimmed} && path : ${path}`);

  res.end("Hello World");
});
// start the server
server.listen(3000, () => {
  console.log("Server is listening on port 3000 now..");
});
