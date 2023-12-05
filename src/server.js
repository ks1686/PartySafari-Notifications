const http = require("http"); //import http module
const url = require("url"); //import url module
const notifsRouter = require("./routes/notifs.routes.js"); //import notifs router module
const sebaRouter = require("./routes/seba_router.js"); //import sebaRouter router module

//specify host and port
const host = "localhost";
const port = 8080;

//create server
const server = http.createServer((request, response) => {
  //CORS Allow all origins
  response.setHeader("Access-Control-Allow-Origin", "*"); //allow all origins
  const parsedUrl = url.parse(request.url); //parse url
  const pathname = parsedUrl.pathname; //get pathname

  if (pathname.includes("/api/notifications")) {
    notifsRouter.applicationServer(request, response); //call notifs router
  } else if (
    pathname === "/promotions" ||
    pathname === "/create-checkout-session" ||
    pathname === "/shopping_cart" ||
    pathname === "/transactions"
  ) {
    router.applicationServer(request, response); //call seba router
  } else {
    response.writeHead(404); //response code: Not Found
    response.end("Not Found"); //response message
  }
});

//listen to server
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

module.exports = server; //export server
