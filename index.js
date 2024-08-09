const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const webpush = require('web-push');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection string (you'll need to set this in Vercel environment variables)
const uri = process.env.MONGODB_URI;

// VAPID keys (set these in Vercel environment variables)
const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;

webpush.setVapidDetails(
  'mailto:your@email.com',
  publicVapidKey,
  privateVapidKey
);

let db;

// Connect to MongoDB
async function connectToDatabase() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  db = client.db('pushnotifications');  // Replace with your database name
  console.log('Connected to MongoDB');
}

connectToDatabase().catch(console.error);

app.get("/api", (req, res) => res.send("Hello World!"));

// The /api/save-subscription endpoint
app.post("/api/save-subscription", async (req, res) => {
  const subscription = req.body;
  await db.collection('subscriptions').insertOne(subscription);
  res.json({ message: "success" });
});

// New endpoint to send push notification
app.post("/api/send-notification", async (req, res) => {
  const { title, body } = req.body;
  const subscriptions = await db.collection('subscriptions').find({}).toArray();
  
  const notifications = subscriptions.map(subscription => {
    return webpush.sendNotification(subscription, JSON.stringify({ title, body }))
      .catch(err => console.error('Error sending notification, subscription removed', err));
  });

  await Promise.all(notifications);
  res.json({ message: "Notifications sent" });
});

module.exports = app;