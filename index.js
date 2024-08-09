const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Low, JSONFile } = require('lowdb');
const { join } = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Initialize LowDB
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Initialize the database with a default structure
const initializeDb = async () => {
  await db.read();
  db.data ||= { subscriptions: [] }; // Default structure
  await db.write();
};

initializeDb();

const port = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("Hello World!"));

// Method to save the subscription to the database
const saveToDatabase = async (subscription) => {
  await db.read();
  db.data.subscriptions.push(subscription);
  await db.write();
};

// The /save-subscription endpoint
app.post("/save-subscription", async (req, res) => {
  const subscription = req.body;
  await saveToDatabase(subscription);
  res.json({ message: "success" });
});

app.listen(port, () => console.log(`Server is running on port ${port}!`));
