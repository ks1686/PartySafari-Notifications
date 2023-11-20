const notifsController = require("../controllers/notifs.controller");

function handleRequest(req, res) {
  notifsController.dbConnect();

  const parsedUrl = new URL(req.url, "http://localhost:3000");
  if (
    parsedUrl.pathname === "/api/notifs/get-one" &&
    req.method === "GET" &&
    parsedUrl.searchParams.has("notif_id")
  ) {
    notifsController.getOneNotifByID(
      req,
      res,
      parsedUrl.searchParams.get("notif_id")
    );
    //!Create a notification added here!
  }
}

module.exports = handleRequest;
