import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cookieParser from "cookie-parser";
import session from "express-session";

const app = express();
const port = 3003;
const client = new MongoClient("mongodb://localhost:27017");
const db = client.db("bank");
const accounts = db.collection("account");

const registerdUsers = client.db("registerdusers");
const users = registerdUsers.collection("user");
const loginProject = client.db("loginproject");
const loginUser = loginProject.collection("users");
const FIVE_MINUTES = 1000 * 60 * 5;

app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "secret",
    cookie: {
      maxAge: FIVE_MINUTES,
    },
  })
);
// skapa en ny accounts
app.post("/newaccount", async (req, res) => {
  const newpost = await accounts.insertOne({
    title: req.body.title,
    date: new Date(),
    saldo: req.body.saldo,
  });
  const inserted = await accounts.findOne({ _id: newpost.insertedId });
  res.json(inserted);
});

// hämtar alla accounts
app.get("/accounts", async (req, res) => {
  const posts = await accounts.find({}).toArray();
  res.json(posts);
  console.log(posts);
});

// hämtar ett accounts med ett id
app.get("/account/:id", async (req, res) => {
  const post = await accounts.findOne({
    _id: new ObjectId(req.params.id),
  });
  res.json(post);
});

// uppdaterar saldo på ett account
app.put("/accounts/:id", async (req, res) => {
  try {
    const updateAccount = await accounts.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          saldo: req.body.saldo,
          title: req.body.title,
        },
      }
    );
    const updatedResponse = await accounts.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json({
      updatedResponse,
      updateAccount,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update post.",
    });
  }
});

app.put("/account/:id/saldo", async (req, res) => {
  try {
    const updateSaldo = await accounts.updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          saldo: req.body.saldo,
        },
      }
    );
    const updatedResponse = await accounts.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.json({
      updatedResponse,
      updateSaldo,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating saldo:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update  saldo.",
    });
  }
});

// raderar ett accounts med ett id
app.delete("/account/:id", async (req, res) => {
  try {
    const deletePost = await accounts.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    res.json({
      deletePost,
      status: "success",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete account.",
    });
  }
});

/////////////////////////////

// LOGGA IN
app.post("/api/login", async (req, res) => {
  const user = req.body.user;
  const password = req.body.password;
  if (user) {
    req.session.user = user;
    res.json({
      user: user,
    });
  } else {
    res.status(401).send({ message: "Wrong username or password" });
  }
});

app.get("/api/loggedin", (req, res) => {
  if (req.session.user) {
    res.json({
      user: req.session.user,
    });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({
      loggedin: false,
    });
  });
});

app.post("/api/register", async (req, res) => {
  const user = req.body.user;
  const password = req.body.password;
  const result = await loginUser.insertOne({
    user: user,
    password: password,
  });
  res.json(result);
});

app.get("/api/cookie", (req, res) => {
  console.log(req.cookies);
  res.send(req.session);
  res.send("Hej");
});

app.listen(port, () => {
  console.log(`Banken Banksson at port ${port}`);
});
