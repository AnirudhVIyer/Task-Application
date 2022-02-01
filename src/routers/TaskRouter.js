const express = require("express");
const Task = require("../models/tasks").TaskModel;
const router = express.Router();
const auth = require("../middleware/auth");

router.post("/task", auth, async (req, res) => {
  // const T1 = new Task(req.body);
  // ... is an operator that expands a container

  const T1 = new Task({
    ...req.body,
    owner: req.user._id,
  });
  //   T1.save()
  //     .then(() => {
  //       res.status(201).send(T1);
  //     })
  //     .catch((err) => {
  //       res.status(400);
  //       res.send(err);
  //     });

  try {
    await T1.save();
    console.log("saved user");
    res.status(201).send(T1); //advantage when multiple await
  } catch (error) {
    res.status(400); // if client side error
    res.send(error);
  }
});

// get resources -------------------------------------

//taks
router.get("/task", auth, async (req, res) => {
  // get all
  //   console.log(req);
  //   Task.find()
  //     .then((data) => {
  //       res.status(201).send(data);
  //     })
  //     .then((err) => {
  //       res.status(400).send(err);
  //     });

  try {
    // const data = await Task.find({ owner: req.user._id }); // will return data promise
    const match = {};
    if (req.query.completed) {
      match.completed = req.query.completed === "true";
    }

    await req.user.populate({
      path: "tasksVirtual",
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort: { createdAt: -1 },
      },
    });
    res.status(200).send(req.user.tasksVirtual);
  } catch (error) {
    res.status(500).send(error); // because server error
  }
});

router.get("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;

  //   Task.findById(id)
  //     .then((data) => {
  //       res.status(201).send(data);
  //     })
  //     .then((err) => {
  //       res.status(400).send(err);
  //     });

  try {
    // const data = await Task.findById(_id);
    const data = await Task.findOne({ _id, owner: req.user._id });
    // so data given only if id and the owner id match a doc.
    if (!data) {
      return res.status(400).send("task not found");
    }
    res.status(201).send(data);
  } catch (error) {
    res.status(500).send(error);
  }
});

//-------------------------------------------

router.patch("/task/:id", auth, async (req, res) => {
  const _id = req.params.id;

  //update validation
  const updates = Object.keys(req.body);
  const allowedupdates = ["description", "completed"];
  const isValidUpdate = updates.every((update) => allowedupdates.includes(update));
  if (!isValidUpdate) {
    return res.status(400).send("Invalid updates");
  }

  try {
    // const task_new = await Task.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(400).send("Task not owned");
    } //this before a task object is filled by updates

    updates.forEach((update) => {
      task[update] = req.body[update]; //dynamic setting
    });
    await task.save();

    res.send(task);
  } catch (error) {
    res.send(error);
  }
});

router.delete("/task/:id", auth, async (req, res) => {
  //checck path url
  const _id = req.params.id;

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });

    if (!task) {
      return res.status(400).send("no task found");
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = { router };
