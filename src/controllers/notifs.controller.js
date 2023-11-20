const dotenv = require("dotenv");
const path = require("path");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASSWORD}@atlascluster.bvzvel0.mongodb.net/?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let notifsCollection;

exports.dbConnect = async () => {
  const db = mongoClient.db("Notifications");
  notifsCollection = db.collection("notifications");
};

exports.getOneNotifByID = async (req, res, notif_id) => {
  //validate presense of notif_id parameter
  if (!notif_id) {
    res.writeHead(400);
    res.end("Missing notif_id parameter");
  }

  try {
    //Fetch notif details using provided notif_id
    const notif = await notifsCollection.findOne({
      _id: new ObjectId(notif_id),
    });

    //If notif not found, return 404 error
    if (!notif) {
      res.writeHead(404);
      res.end("Notif not found");
    }
    console.log(notif);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(notif));
  } catch (error) {
    console.log(error);
    res.writeHead(500);
    res.end("Internal server error");
  }
};

//!Create a notification
