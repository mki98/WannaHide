const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const sockets = require("./Controllers/socketsController");
const usersRoutes = require("./Routes/usersRoutes");
const viewsRoutes = require("./Routes/viewsRoutes");
const chatsRoutes = require("./Routes/chatsRoutes");
const messagesRoutes = require("./Routes/messagesRoutes");

const { errorHandler } = require("./Middleware/errorHandler");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.options("*", cors());

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/chats", chatsRoutes);
app.use("/api/v1/messages", messagesRoutes);
app.use("/", viewsRoutes);

const DB = process.env.DB;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "chatApp",
  })
  .then(() => console.log("DB connection successful!"))
  .catch((error) => {
    console.log(error);
  });

server.listen(5000, () => {
  console.log("Server is Running on port 5000");
});
sockets.handelSockets(server);
app.use(errorHandler);
