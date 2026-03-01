const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Force Node.js to use Google DNS (ISP DNS blocks TCP SRV queries)

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.port || 3000;
const stripe = require("stripe")(process.env.DB_Stripe_Key);
var admin = require("firebase-admin");
const decoded = Buffer.from(process.env.DB_Service_Key, 'base64').toString('utf8');

var serviceAccount = JSON.parse(decoded);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const uri = "mongodb+srv://collabdata:WKIZeI75099xFYgy@cluster0.zgfy1fv.mongodb.net/?appName=Cluster0";

// middleWare
app.use(cors());
app.use(express.json());

// middleware for verifying Token
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);

  // Check if the Authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authorization header missing or invalid format'
    });
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    console.log('Token verified successfully:', decoded);
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token'
    });
  }
  // next();
};

// middleware for email checking

const verifyTokenEmail = (req, res, next) => {
  try {
    console.log("Decoded User:", req.user);
    console.log("Email from query:", req.query.email);
    const decoded = req.user; // ✅ Use the same key you attached in verifyToken

    if (!decoded || decoded.email !== req.query.email) {
      return res.sendStatus(401); // Unauthorized
    }

    next();
  } catch (error) {
    console.error('verifyTokenEmail Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
  // next();
};

//------------------------- Token Verification Middleware -------------------------------------------//

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
//------------------------- Making API from here -------------------------------------------//

// create database and table
const CollabEdDB = client.db("collabdata");
const userList = CollabEdDB.collection("userList");
const sessionList = CollabEdDB.collection("sessionList");
const materialList = CollabEdDB.collection("materialList");
const notesCollection = CollabEdDB.collection("notesCollection");
const bookingList = CollabEdDB.collection("bookingList");
const paymentList = CollabEdDB.collection("paymentList");

//  find the user in the userlist

app.get("/findTheUser", async (req, res) => {
  const email = req.query.email;
  console.log("Email form here: ", email);

  const result = await userList.findOne({ email: email });
  console.log(result, "hit from here");

  res.send(result ? true : false);
});
//  find the user in the userlist

app.get("/searchTheUser", async (req, res) => {
  const email = req.query.email;
  console.log("Email form here: ", email);

  const result = await userList.findOne({ email: email });
  console.log("axios hit", result);

  res.send(result);
});

// post the user into the userList

app.post("/postTheUser", async (req, res) => {
  const data = req.body;
  console.log("data : ", data);

  const result = await userList.insertOne(data);
  console.log(result, "hit from here post");

  res.send(result);
});
// post the user into the userList

// post the createSession
app.post("/createSession", verifyToken, verifyTokenEmail, async (req, res) => {
  const data = req.body;
  console.log("data : ", data);
  const result = await sessionList.insertOne(data);
  res.send(result);
});
// post the createSession

// post the tutorMySessions
app.get("/tutorMySessions", verifyToken, verifyTokenEmail, async (req, res) => {
  const email = req.query.email;
  console.log("Email from here: ", email);

  try {
    const result = await sessionList.find({ tutorEmail: email }).toArray();
    console.log(result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch tutor sessions" });
  }
});
// post the tutorMySessions

// patch the updateSessionStatus
app.patch("/updateSessionStatus", async (req, res) => {
  // const status = req.body;
  const sessionId = req.query.id;
  // console.log("Session ID: ", sessionId, "Status: ", status);

  const result = await sessionList.updateOne(
    { _id: new ObjectId(sessionId) },
    {
      $set: {
        status: "pending",
        rejectionReason: null,
        rejectionFeedback: null,
      },
    }
  );

  console.log("Update Result: ", result);
  res.send(result);
});
// patch the updateSessionStatus

// get the approvedSessionsList
app.get("/approvedSessionsList", verifyToken, verifyTokenEmail, async (req, res) => {
  const email = req.query.email;
  console.log("Email from here: ", email);

  try {
    const result = await sessionList
      .find({ tutorEmail: email, status: "approved" })
      .toArray();
    console.log(result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch approved sessions" });
  }
});
// get the approvedSessionsList

//post the uploadMaterials
app.post("/uploadMaterials", verifyToken, verifyTokenEmail, async (req, res) => {
  const data = req.body;
  console.log("Data: ", data);

  try {
    const result = await materialList.insertOne(data);
    console.log("Upload Result: ", result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to upload materials" });
  }
});
//post the uploadMaterials

// get the getAllMaterials
app.get("/getAllMaterials", verifyToken, verifyTokenEmail, async (req, res) => {
  const email = req.query.email;

  try {
    const result = await materialList.find({ tutorEmail: email }).toArray();
    console.log(result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch materials" });
  }
});
// get the getAllMaterials

// get the allUsers
app.get("/getAllUsers", verifyToken, verifyTokenEmail, async (req, res) => {
  const search = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = search
    ? {
      $or: [
        { userName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }
    : {};

  const users = await userList.find(query).skip(skip).limit(limit).toArray();
  const total = await userList.countDocuments(query);

  res.send({ users, total });
});

// get the allUsers

// update the updateUserRole
app.patch("/updateUserRole", verifyToken, verifyTokenEmail, async (req, res) => {
  // const email = req.query.email;
  const role = req.query.role;
  const id = req.query.id;
  console.log("Role from here: ", role);
  console.log("ID from here: ", id);
  try {
    const result = await userList.updateOne(
      { _id: new ObjectId(id) },
      { $set: { userRole: role } }
    );
    console.log("Update Result: ", result);
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to update user role" });
  }
});
