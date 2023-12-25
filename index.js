const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { PortNumber, MONGODB_URL, ACCESS_TOKEN_KEY_VALUE } = require("./secret");
//middleWare
app.use(
  cors({
    origin: ["https://taskmanagement-beige.vercel.app/"],
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
const tasklists = client.db("task-management").collection("taskliss");

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
//UsersPost Controller
app.post("/api/users", (req, res, next) => {
  try {
    const users = req.body;
    const token = jwt.sign(users, ACCESS_TOKEN_KEY_VALUE, { expiresIn: "24h" });
    if (token) {
      res.status(200).send({ token });
    }
  } catch (error) {
    console.log(error.message);
  }
});

//Task Get Controller
app.get("/api/tasks", VerifyToken, async (req, res, next) => {
  const email = req?.query?.email;
  if (email !== req?.decoded?.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  const resData = await tasklists.find({ email }).toArray();
  return res.status(200).send(resData.reverse());
});
//Task GetBy ID Controller
app.get("/api/tasks/:id", async (req, res, next) => {
  const id = req?.params?.id;
  const resData = await tasklists.findOne({ _id: new ObjectId(id) });
  return res.status(200).send(resData);
});

//Task Delete Controller
app.delete("/api/tasks/delete/:id", VerifyToken, async (req, res, next) => {
  const email = req?.query?.email;
  if (email !== req?.decoded?.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  const id = req?.params?.id;
  const resDeleteData = await tasklists.deleteOne({ _id: new ObjectId(id) });
  return res.status(200).send(resDeleteData);
});

//Creating  Task Update Request
app.patch("/api/task/update/:id", VerifyToken, async (req, res, next) => {
  const email = req?.query?.email;
  if (email !== req?.decoded?.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  const id = req?.params?.id;
  const filter = { _id: new ObjectId(id) };
  const query = { $set: req?.body };
  const createInfo = await tasklists.updateOne(filter, query);
  return res.status(200).send(createInfo);
});
//Creating  Task Post Request
app.post("/api/task/create", VerifyToken, async (req, res, next) => {
  const email = req?.query?.email;
  if (email !== req?.decoded?.email) {
    return res.status(403).send({ message: "forbidden access" });
  }
  const createInfo = await tasklists.insertOne(req?.body);
  return res.status(200).send(createInfo);
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
