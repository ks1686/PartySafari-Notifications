// http module
const http = require('http');
// url module
const url = require('url');

// Import route handler
const router = require("../routes/seba_router.js");

// Host & Port
const host = 'localhost';
const port = (process.env.PORT || 8000);

// Creating server
const server = http.createServer((request, response) => {
    //CORS Allow all origins
    response.setHeader("Access-Control-Allow-Origin", "*");
    const parsedUrl = url.parse(request.url);
    const pathname = parsedUrl.pathname;

    if (pathname === '/promotions' || pathname === '/create-checkout-session' || pathname === '/shopping_cart' || pathname === '/transactions'){
        router.applicationServer(request, response);
    } else {
        response.writeHead(404);
        response.end("Not Found");
    }
});

// Listening at port 8000
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});

module.exports = server;