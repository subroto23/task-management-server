const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { PortNumber, MONGODB_URL, ACCESS_TOKEN_KEY_VALUE } = require("./secret");
//middleWare
app.use(
  cors({
    origin: ["http://localhost:5173/"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Connnect Mongodb
const client = new MongoClient(MONGODB_URL, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//
const mongodbConnection = async () => {
  try {
    // await client.connect();
    console.log("Mongodb Connected Successfully");
  } catch (error) {
    console.log("Mongodb Not Connected");
  }
};

//Mongodb Document And Collection Setup
const taskslist = client.db("task-management").collection("taskslist");

//MiddleWare
const VerifyToken = (req, res, next) => {
  if (!req?.headers?.authorization) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = req?.headers?.authorization.split(" ")[1];
  jwt.verify(token, ACCESS_TOKEN_KEY_VALUE, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

//
app.get("/", (req, res) => {
  res.send("Welcome to the Task Management Server");
});

//
//Error Router
app.use((err, req, res, next) => {
  res.statusCode(500).send("Something went wrong");
});

//Server Preview Check
app.listen(PortNumber, async () => {
  console.log(`Server is Running at http://localhost:${PortNumber}`);
  //Mongodb Connections
  await mongodbConnection();
});
