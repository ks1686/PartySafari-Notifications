require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_USER_PASSWORD}@atlascluster.bvzvel0.mongodb.net/?retryWrites=true&w=majority`;
const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let userCollection; // Declare a variable to hold the user collection

// Connect to MongoDB and set up collections for use
exports.dbConnect = () => {
  const db = mongoClient.db("Users"); // Connect to the Users database
  userCollection = db.collection("User Data"); // Set the user collection
};

exports.getUserDetails = async (req, res, user_id) => {
  try {
    const user = await userCollection.findOne({ _id: user_id }); // Retrieve the user from the database
    console.log(user); // Log the user; for testing purposes
    res.writeHead(200, { "Content-Type": "application/json" }); // Set the status code and content type
    res.end(JSON.stringify(user)); // Send the response
  } catch (error) {
    console.log(error); // Log the error; for testing purposes
    res.writeHead(500, { "Content-Type": "application/json" }); // Set the status code and content type
    res.end(JSON.stringify({ error: "Internal Server Error" })); // Send the response
  }
};
