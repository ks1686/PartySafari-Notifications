// MongoDB client module
const { MongoClient } = require("mongodb"); //import mongodb module
const sgMail = require("@sendgrid/mail"); //import sendgrid module
const Filter = require("bad-words"); //import bad-words module
const dotenv = require("dotenv"); //import dotenv module
dotenv.config(); //configure dotenv module

//set up db connection
async function initiateDBConnection(response) {
  //define uri
  const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASSWORD}@atlascluster.bvzvel0.mongodb.net/?retryWrites=true&w=majority`;
  const client = new MongoClient(uri);
  try {
    await client.connect(); //connect to client
    return client; //return client
  } catch (err) {
    response.writeHead(503); //response code: Service Unavailable
    response.end("Database not available"); //response message
    return null; //return null
  }
}

//!Notifications API functions

//getNotif function
async function getNotif(request, response, notif_id) {
  const client = await initiateDBConnection(response); //connect to db

  try {
    //TODO: using ST2 cookie implementation to verify access to API

    //sget notif
    const notifCollection = client.db("Notifications").collection("notifs"); //get notif collection
    const notif = await notifCollection.findOne({
      notif_id: notif_id,
    });

    //if notif not found/doesn't exist
    if (notif_id == null) {
      response.writeHead(404); //Response Code: Not Found
      response.end("Notification not found"); //Response Message
    }
    //if notif exists
    else {
      response.setHeader("Content-Type", "application/json"); //set content type to json
      response.writeHead(200); //Response Code: OK
      response.end(JSON.stringify(notif)); //Response Message
    }
  } catch (err) {
    response.writeHead(400); //Response Code: Bad Request
    response.end("Bad Request"); //Response Message
  } finally {
    await client.close(); //close connection
  }
}

//createNotif function
async function createNotif(request, response, user_id, host_id) {
  const client = await initiateDBConnection(response); //connect to db

  //TODO: using ST2 cookie implementation to verify access to API

  //get body of request
  let body = "";
  request.on("data", function (data) {
    body += data;
  });

  //when request is done
  request.on("end", async function () {
    try {
      const notifCollection = client.db("Notifications").collection("notifs"); //get notif collection
      const filter = new Filter(); //filter bad words
      body = filter.clean(body); //clean body

      //construct new notif
      const newNotif = {
        notif_id: crypto.randomUUID(),
        user_id: user_id,
        host_id: host_id,
        notif_text: body,
      };

      //insert new notif
      await notifCollection.insertOne(newNotif);

      response.setHeader("Content-Type", "text/plain"); //set content type to plain text
      response.writeHead(201); //Response Code: Created
      response.end("Notification created"); //Response Message
    } catch {
      response.writeHead(400); //Response Code: Bad Request
      response.end("Bad Request"); //Response Message
    } finally {
      await client.close(); //close connection
    }
  });
}

//updateNotif function
async function updateNotif(request, response, notif_id) {
  const client = await initiateDBConnection(response); //connect to db

  //TODO: using ST2 cookie implementation to verify access to API

  //get body of request
  let body = "";
  request.on("data", function (data) {
    body += data;
  });

  //when request is done
  request.on("end", async function () {
    try {
      //filter bad words
      const filter = new Filter();
      body = filter.clean(body);

      //update notif
      const notifCollection = client.db("Notifications").collection("notifs");
      const result = await notifCollection.updateOne(
        { notif_id: notif_id },
        { $set: { notif_text: body } }
      );

      //if notif not found or doesn't exist
      if (result.modifiedCount === 0) {
        response.writeHead(404); //Response Code: Not Found
        response.end("Notification not found"); //Response Message
      }

      response.setHeader("Content-Type", "text/plain"); //set content type to plain text
      response.writeHead(201); //Response Code: Created
      response.end("Notification updated"); //Response Message
    } catch {
      response.writeHead(400); //Response Code: Bad Request
      response.end("Bad Request"); //Response Message
    } finally {
      await client.close(); //close connection
    }
  });
}

//deleteNotif function
async function deleteNotif(request, response, notif_id) {
  const client = await initiateDBConnection(response); //connect to db

  try {
    //TODO: using ST2 cookie implementation to verify access to API

    //check if notif exists
    const notifCollection = client.db("Notifications").collection("notifs");
    const notif = await notifCollection.findOne({
      notif_id: notif_id,
    });

    //if notif not found/doesn't exist
    if (notif == null) {
      response.writeHead(404);
      response.end("Notification not found");
    }
    //if notif exists
    else {
      //delete notif
      await notifCollection.deleteOne({ notif_id: notif_id });
      response.writeHead(200); // Response Code: OK
      response.end("Notification deleted"); // Response Message
    }
  } catch (err) {
    response.writeHead(400); // Response Code: Bad Request
    response.end("Bad Request"); // Response Message
  } finally {
    await client.close(); //close connection
  }
}

//sendNotif function
async function sendNotif(request, response, notif_id) {
  const client = await initiateDBConnection(response); //connect to db
  try {
    //get collections
    const notifCollection = client.db("Notifications").collection("notifs");
    const userCollection = client.db("Notifications").collection("users");

    //TODO: using ST2 cookie implementation to verify access to API

    //get necessary info from db
    const notif = await notifCollection.findOne({ notif_id: notif_id });
    const user_id = notif.user_id;
    const user = await userCollection.findOne({ user_id: user_id });
    const notif_text = notif.notif_text;
    const email_address = user.email_address;

    //condigure SendGrid
    const sendgridMail = require("@sendgrid/mail");
    sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

    //create message
    const msg = {
      to: email_address,
      from: "karim.smires@rutgers.edu",
      subject: "PartySafari Notification",
      text: notif_text,
    };

    //send email
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgMail
      .send(msg)
      .then(() => {
        response.writeHead(200, { "Content-Type": "text/plain" }); //200 OK
        response.end("Notif sent"); //End response
      })
      .catch((error) => {
        console.error(error);
        response.writeHead(500, { "Content-Type": "text/plain" }); //500 Internal Server Error
        response.end("Internal server error"); //End response
      });
  } catch (error) {
    console.error(error); //log error
  }
}

module.exports = {
  getNotif,
  createNotif,
  deleteNotif,
  updateNotif,
  sendNotif,
};
