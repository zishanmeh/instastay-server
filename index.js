const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_SCERET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    console.log(req.user);
    next();
  });
};

// MongoDB URI with credentials from .env file
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nujbi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const roomsCollection = client.db("roomsDB").collection("allRooms");
    const bookingCollection = client.db("roomsDB").collection("bookings");
    const reviewCollection = client.db("roomsDB").collection("reviews");

    // Endpoint to fetch all rooms
    app.get("/", async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });
    app.get("/roomsSortByPrice", async (req, res) => {
      const result = await roomsCollection.find().sort({ price: 1 }).toArray();
      res.send(result);
    });
    app.get("/latestRoom", async (req, res) => {
      const result = await roomsCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    app.get("/latestReview", async (req, res) => {
      const result = await reviewCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();
      res.send(result);
    });
    app.get("/room/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });
    app.get("/room-bookings", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };

      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/all-reviews", async (req, res) => {
      const id = req.query.id;
      const query = { roomId: id };
      const result = await reviewCollection.find(query).toArray();
      res.send(result);
    });
    // Delete booking by id
    app.delete("/delete/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    // Creating jwt token
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_SCERET, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });
    // logging out
    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    app.post("/room/booking", async (req, res) => {
      const newBooking = req.body;
      const result = await bookingCollection.insertOne(newBooking);
      res.send(result);
    });
    app.post("/review", async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });
    app.patch("/update-availability-false/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: { availability: false } };
      const result = await roomsCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch("/update-availability-true/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: { availability: true } };
      const result = await roomsCollection.updateOne(query, updateDoc);
      res.send(result);
    });
    app.patch("/update-booking-date/:id", async (req, res) => {
      const id = req.params.id;
      const updatedDay = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: { booking_day: updatedDay.booking_day } };
      const result = await bookingCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    console.log("Connected to MongoDB and API is ready!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
