const mongoose = require("mongoose");
const validator = require("validator");

const TaskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    // child lateral
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  {
    timestamps: true,
  }
);

const TaskModel = mongoose.model("Tasks", TaskSchema);

module.exports = { TaskModel };

// const t1 = new TaskModel({ description: "Clean the dishes", completed: false });
// const t2 = new TaskModel({ description: "Bathe    " });

// t2.save()
//   .then(() => {
//     console.log(t1);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
