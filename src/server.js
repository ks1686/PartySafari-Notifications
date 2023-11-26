const http = require("http");
const url = require("url");

//Import route handler
const serveLandingPage = require("./views/landingPage.views.js");
const serveNotifsPage = require("./views/notifsPage.views.js");
const serveStaticFile = require("./views/staticFile.views.js");

//Create the server
const server = http.createServer((req, res) => {
  //CORS Allow all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  // Route the request to the appropriate handler
  if (pathname === "/") {
    serveLandingPage(req, res);
  } else if (pathname === "/notifications") {
    serveNotifsPage(req, res);
  } else if (pathname.endsWith(".js") || pathname.endsWith(".css")) {
    serveStaticFile(req, res);
  } else {
    res.writeHead(404);
    res.end("Page not found");
  }
});

const port = 3000;
const host = "localhost";
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

module.exports = server;
