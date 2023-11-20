const http = require("http");
const url = require("url");

//Import route handler
const serveLandingPage = require("./views/landingPage.views.js");
const serveNotifsPage = require("./views/notifsPage.views.js");

//Create the server
const server = http.createServer((req, res) => {
  //CORS Allow all origins
  res.setHeader("Access-Control-Allow-Origin", "*");
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;

  //Route to handler
  if (pathname === "/") {
    serveLandingPage(req, res);
  } else if (pathname === "/notifs") {
    serveNotifsPage(req, res);
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
