//This file will create the server and use the routes defined in user.routes.js.
const http = require("http"); // Import the http module
const handleRequest = require("./routes/user.routes.js"); // Import the handleRequest function

const server = http.createServer((req, res) => {
  //Enable CORS - Allow all origins
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.url.startsWith("/users")) {
    handleRequest(req, res); // Handle the request
  } else {
    res.statusCode = 404; // Set the status code to 404, blame user
    res.end("Not found"); // Send the response
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log the port; for testing purposes
});
server.on("error", (error) => {
  console.error(`Server encountered an error: ${error.message}`); // Log the error; for testing purposes
});
