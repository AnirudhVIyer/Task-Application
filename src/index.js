const express = require("express");
require("./db/mongoose"); //runs this file to make connection
const jwt = require("jsonwebtoken");

const UserRouter = require("./routers/UserRouter").router;
const TaskRouter = require("./routers/TaskRouter").router;
// use http not https while browsing

const app = express();
const port = process.env.PORT;

// // always put middleware at top, or in middleware folder

// app.use((req, res, next) => {
//   console.log("express middleware");
//   next();
// });

app.use(express.json()); // parses the incoming request
// send in json form only

app.use(UserRouter);
app.use(TaskRouter);

app.listen(port, () => {
  console.log("connected to server");
});

// const bcryptjs = require("bcryptjs");

// const myFuc = async () => {
//   const token = jwt.sign({ _id: "token124" }, "randomsecret"); //func returns a token to a client
//   console.log(token);

//   const ver = jwt.verify(token, "randomsecret", { expiresIn: "7 days" });
//   console.log(ver);
// };

// myFuc();

// linkink entities
const User = require("./models/user").User;
const Task = require("./models/tasks").TaskModel;
const myFunc = async () => {
  //finding task using the owner propery
  // const task = await Task.findById("61f444789523b370d96da42a");
  // await task.populate("owner");
  // // we are populating the owner field of task(which had owner id) with the complete document of that owner from users collection
  // console.log(task.owner);

  // finding task using user -- virtual relation established
  const user = await User.findById("61f442f3a69b2b32ff429e4b");
  await user.populate("tasksVirtual");
  console.log(user.tasksVirtual);
};
// myFunc();
