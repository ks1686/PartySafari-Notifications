const notifsController = require("../controllers/notifs.controller");

function handleRequest(req, res) {
  notifsController.dbConnect();

  const parsedUrl = new URL(req.url, "http://localhost:3000");
  //Getting one notification given a notif_id
  if (
    parsedUrl.pathname === "/api/notifications/get-one" &&
    req.method === "GET" &&
    parsedUrl.searchParams.has("notif_id")
  ) {
    notifsController.getOneNotifByID(
      req,
      res,
      parsedUrl.searchParams.get("notif_id")
    );
  }

  //Creating a notification
  else if (
    parsedUrl.pathname === "/api/notifications/create" &&
    req.method === "POST" &&
    parsedUrl.searchParams.has("user_id") &&
    parsedUrl.searchParams.has("host_id") &&
    parsedUrl.searchParams.has("notification_id") &&
    parsedUrl.searchParams.has("notification_text")
  ) {
    notifsController.createNotif(
      req,
      res,
      parsedUrl.searchParams.get("user_id"),
      parsedUrl.searchParams.get("host_id"),
      parsedUrl.searchParams.get("notification_id"),
      parsedUrl.searchParams.get("notification_text")
    );
  }

  //Updating an existing notification
  else if (
    parsedUrl.pathname === "/api/notifications/update" &&
    req.method === "PUT" &&
    parsedUrl.searchParams.has("notif_id") &&
    parsedUrl.searchParams.has("user_id") &&
    parsedUrl.searchParams.has("host_id") &&
    parsedUrl.searchParams.has("notification_id") &&
    parsedUrl.searchParams.has("notification_text")
  ) {
    notifsController.updateNotif(
      req,
      res,
      parsedUrl.searchParams.get("notif_id"),
      parsedUrl.searchParams.get("user_id"),
      parsedUrl.searchParams.get("host_id"),
      parsedUrl.searchParams.get("notification_id"),
      parsedUrl.searchParams.get("notification_text")
    );
  }

  //Deleting an existing notification
  else if (
    parsedUrl.pathname === "/api/notifications/delete" &&
    req.method === "DELETE" &&
    parsedUrl.searchParams.has("notif_id")
  ) {
    notifsController.deleteNotif(
      req,
      res,
      parsedUrl.searchParams.get("notif_id")
    );
  }

  //Sending an existing notifation
  else if (
    parsedUrl.pathname === "/api/notifications/send" &&
    req.method === "POST" &&
    parsedUrl.searchParams.has("notif_id")
  ) {
    notifsController.sendNotif(
      req,
      res,
      parsedUrl.searchParams.get("notif_id")
    );
  }

  //Error 404: Not found
  else {
    res.writeHead(404);
    res.end("Not found");
  }
}

module.exports = handleRequest;
