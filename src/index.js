const express = require("express");
require("./db/mongoose"); //runs this file to make connection
const jwt = require("jsonwebtoken");

const UserRouter = require("./routers/UserRouter").router;
const TaskRouter = require("./routers/TaskRouter").router;
// use http not https while browsing

const app = express();
const port = process.env.PORT;

app.use(express.json()); // parses the incoming request
// send in json form only

app.use(UserRouter);
app.use(TaskRouter);

app.listen(port, () => {
  console.log("connected to server");
});
