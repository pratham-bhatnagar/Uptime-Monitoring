const app = {};

app.congif = {
  sessionToken: false,
};

// AJAX Clinent: For the Restful API

app.client = {};

app.client.request = function (
  headers,
  path,
  method,
  query,
  payload,
  callback
) {
  //sanity checking
  headers = typeof headers == "object" && headers !== null ? headers : {};
  path = typeof path == "string" ? path : "/";
  method =
    typeof method == "string" &&
    ["POST", "GET", "PUT", "DELETE"].indexOf(method.toUpperCase()) > -1
      ? method.toUpperCase()
      : "GET";
  query = typeof query == "object" && query !== null ? query : {};
  payload = typeof payload == "object" && payload !== null ? payload : {};
  callback = typeof callback == "function" ? callback : false;

  var requestUrl = path + "?";
  var counter = 0;
  for (var queryKey in query) {
    if (query.hasOwnProperty(queryKey)) {
      counter++;
      if (counter > 1) {
        requestUrl += "&";
      }

      requestUrl += queryKey + "=" + query[queryKey];
    }
  }

  // Form the http request as a JSON type
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for (var headerKey in headers) {
    if (headers.hasOwnProperty(headerKey)) {
      xhr.setRequestHeader(headerKey, headers[headerKey]);
    }
  }

  // setting token as a header
  if (app.config.sessionToken) {
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // When the request comes back, handle the response
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      var statusCode = xhr.status;
      var responseReturned = xhr.responseText;

      if (callback) {
        try {
          var parsedResponse = JSON.parse(responseReturned);
          callback(statusCode, parsedResponse);
        } catch (e) {
          callback(statusCode, false);
        }
      }
    }
  };
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);
};
