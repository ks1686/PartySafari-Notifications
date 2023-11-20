// This file will handle all the routing
const userController = require("../controllers/user.controller.js");

function handleRequest(req, res) {
  user.dbConnect(); // Connect to the database

  console.log("handling request"); // Log the request; for testing purposes
  const parsedUrl = new URL(req.url, "http://localhost:3000"); // Parse the URL
  if (parsedUrl.pathname === "/users/user_id" && req.method === "GET") {
    // Check if the request is for the user details
    console.log("handling3333 request"); // Log the request; for testing purposes
    userController.getUserDetails(
      // Call the getUserDetails function from the user controller
      req,
      res,
      parsedUrl.searchParams.get("user_id") // Retrieve the user_id from the URL
    );
  }
}

module.exports = handleRequest; // Export the handleRequest function
