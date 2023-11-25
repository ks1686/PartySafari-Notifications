const dotenv = require("dotenv"); //import dotenv module
const path = require("path"); //import path module
const sgMail = require("@sendgrid/mail"); //import sendgrid module

//Configure mongoDB
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASSWORD}@atlascluster.bvzvel0.mongodb.net/?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let notifsCollection;
let usersCollection;
let hostCollection; //unsure if needed

exports.dbConnect = async () => {
  const db = mongoClient.db("Notifications");
  notifsCollection = db.collection("notifications");
  usersCollection = db.collection("users");
  hostCollection = db.collection("hosts");
};

//?For testing, not really neede
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
    console.log(notif); //Log notif details to console
    res.writeHead(200, { "Content-Type": "application/json" }); //200 OK
    res.end(JSON.stringify(notif)); //End response
  } catch (error) {
    console.log(error); //Log error to console
    res.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
    res.end("Internal server error"); //End response
  }
};

//Create a notification
exports.createNotif = async (
  req,
  res,
  user_id,
  host_id,
  notification_id,
  notification_text
) => {
  //validate presense of user_id parameter
  if (!user_id) {
    res.writeHead(400);
    res.end("Missing user_id parameter");
  }

  //validate presense of host_id parameter
  if (!host_id) {
    res.writeHead(400);
    res.end("Missing host_id parameter");
  }

  //validate presense of notification_id parameter
  if (!notification_id) {
    res.writeHead(400);
    res.end("Missing notification_id parameter");
  }

  //validate presense of notification_text parameter
  if (!notification_text) {
    res.writeHead(400);
    res.end("Missing notification_text parameter");
  }

  try {
    //Check if notif exists already
    const existingNotif = await notifsCollection.findOne({
      user_id: user_id,
      host_id: host_id,
      notification_id: notification_id,
    });

    //If notif exists, return 409 error
    if (existingNotif) {
      res.writeHead(409);
      res.end("Notif already exists");
    }

    //Create new notif doc
    const notif = {
      user_id: user_id,
      host_id: host_id,
      notification_id: notification_id,
      notification_text: notification_text,
    };

    //Insert new notif doc into notifs collection
    const result = await notifsCollection.insertOne(notif);

    //Check if insert worked
    if (result.insertedCount === 1) {
      res.writeHead(201, { "Content-Type": "text/plain" }); //201 Created
      res.end("Notif created"); //End response
    } else {
      res.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
      res.end("Internal server error"); //End response
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
    res.end("Internal server error"); //End response
  }
};

//Update a notification
exports.updateNotif = async (
  req,
  res,
  user_id,
  host_id,
  notification_id,
  notification_text
) => {
  //validate presense of all parameters
  const params = { user_id, host_id, notification_id, notification_text };
  for (const param in params) {
    if (!params[param]) {
      //If parameter is missing
      res.writeHead(400);
      res.end(`Missing ${param} parameter`);
    }
  }

  try {
    //Check if notif exists already
    const existingNotif = await notifsCollection.findOne({
      user_id: user_id,
      host_id: host_id,
      notification_id: notification_id,
    });

    //If notif exists, update it
    if (existingNotif) {
      const result = await notifsCollection.updateOne(
        {
          user_id: user_id,
          host_id: host_id,
          notification_id: notification_id,
        },
        {
          $set: {
            notification_text: notification_text,
          },
        }
      );

      //Check if update worked
      if (result.modifiedCount === 1) {
        res.writeHead(200, { "Content-Type": "text/plain" }); //200 OK
        res.end("Notif updated"); //End response
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
        res.end("Internal server error"); //End response
      }
    } else {
      res.writeHead(404);
      res.end("Notif not found");
    }
  } catch (error) {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
    res.end("Internal server error"); //End response
  }
};

//Delete a notification
exports.deleteNotif = async (req, res, user_id, host_id, notification_id) => {
  //validate presense of all parameters
  const params = { user_id, host_id, notification_id };
  for (const param in params) {
    if (!params[param]) {
      //If parameter is missing
      res.writeHead(400);
      res.end(`Missing ${param} parameter`);
    }
  }

  try {
    //Check if notif exists already
    const existingNotif = await notifsCollection.findOne({
      user_id: user_id,
      host_id: host_id,
      notification_id: notification_id,
    });

    //If notif exists, delete it
    if (existingNotif) {
      const result = await notifsCollection.deleteOne({
        user_id: user_id,
        host_id: host_id,
        notification_id: notification_id,
      });

      //Check if delete worked
      if (result.deletedCount === 1) {
        res.writeHead(200, { "Content-Type": "text/plain" }); //200 OK
        res.end("Notif deleted"); //End response
      } else {
        res.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
        res.end("Internal server error"); //End response
      }
    } else {
      res.writeHead(404);
      res.end("Notif not found");
    }
  } catch {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
    res.end("Internal server error"); //End response
  }
};

//Sending a notification given notification_id
exports.sendNotif = async (req, res, notification_id) => {
  //Check notification exists
  const notif = await notifsCollection.findOne({
    notification_id: notification_id,
  });

  //If notif not found, return 404 error
  if (!notif) {
    res.writeHead(404);
    res.end("Notif not found");
  }

  //Get notification text and user_id
  const notifText = notif.notification_text;
  const user_id = notif.user_id;

  try {
    //Get user email
    const user = await usersCollection.findOne({
      _id: new ObjectId(user_id),
    });
    const userEmail = user.email_address; //Get user email

    //Construct email
    const msg = {
      to: userEmail, // Change to your recipient
      from: "karim.smires@rutgers.edu",
      subject: "PartySafari Notification",
      text: notifText,
    };

    //Send email
    sgMail
      .send(msg)
      .then(() => {
        res.writeHead(200, { "Content-Type": "text/plain" }); //200 OK
        res.end("Notif sent"); //End response
      })
      .catch((error) => {
        console.error(error);
        res.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
        res.end("Internal server error"); //End response
      });
  } catch {
    console.error(error);
    res.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
    res.end("Internal server error"); //End response
  }
};
