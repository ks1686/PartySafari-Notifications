// landingPage.views.js

const fs = require("fs");
const path = require("path");
//const filePath = path.join(__dirname, "./../../public/html/landingPage.html");

const servePage = (req, res) => {
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end("Error loading HTML file");
    } else {
      res.setHeader("Content-Type", "text/html");
      res.statusCode = 200;
      res.end(data);
    }
  });
};

module.exports = servePage;
