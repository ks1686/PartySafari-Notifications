// staticFiles.views.js

const fs = require("fs");
const path = require("path");

function servePage(req, res) {
  const extension = path.extname(req.url);
  const validExtensions = {
    ".js": "application/javascript",
    ".css": "text/css",
  };

  const contentType = validExtensions[extension] || "text/plain";

  fs.readFile(
    path.join(__dirname, "../../public", req.url),
    "utf8",
    (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Page not found");
      } else {
        res.writeHead(200, { "Content-Type": contentType });
        res.end(data);
      }
    }
  );
}

module.exports = servePage;
