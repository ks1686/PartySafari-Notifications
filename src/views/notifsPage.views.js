//Currently not in operation; couldn't figure out how to do the front-end

const path = require("path");
const fs = require("fs").promises;

const servePage = async (req, res) => {
  try {
    //Read HTML template
    const templatePath = path.join(
      __dirname,
      "../../public/html/notifsTemplate.html"
    );
    const htmlContent = await fs.readFile(templatePath, "utf8");

    //Serve HTML content
    res.setHeader("Content-Type", "text/html");
    res.statusCode = 200;
    res.end(htmlContent);

    console.log("Notifs page served successfully");
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.end("Error loading notifs page");
  }
};

module.exports = servePage;
