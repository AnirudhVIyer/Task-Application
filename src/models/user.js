const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { json } = require("express");
const Task = require("./tasks").TaskModel;
//User Model
// make user schema to set type, validation and sanitization
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // sanitization for String type
      lowercase: true,
    },
    email: {
      required: true,
      type: String,
      trim: true, // only leading and lagging spaces
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("not a valid email");
        }
      },
    },
    age: {
      type: Number,
      validate(value) {
        // validation
        if (value <= 0) {
          throw new Error("negative values not accepted");
        }
      },
      default: 18,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error("Password can't contain the word password");
        }
      },
    },
    avatar: {
      type: Buffer,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

//statics are model specific
UserSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user.password) {
    throw new Error("no password saved");
  }
  if (!user) {
    throw new Error("No user found");
  }

  const valid = await bcryptjs.compare(password, user.password);
  if (!valid) {
    throw new Error("invalid password");
  }

  console.log("User verified");
  return user;
};

//use virtual to create a entity relationship, knows how to link
// this creates a virtual field that can be populated later
UserSchema.virtual("tasksVirtual", {
  ref: "Tasks",
  localField: "_id",
  foreignField: "owner",
});

//generate jwt here we have to use this on an object of the class so method and not static

UserSchema.methods.generateAuthtoken = async function () {
  const user = this;
  const token_new = jwt.sign({ _id: user["_id"] }, process.env.JWT_SECRET);
  console.log(token_new);
  user.tokens = user.tokens.concat({ token: token_new });
  await user.save();
  return token_new;
  // token being returned but stores in the user model.
};

// to prevent password and tokens from showing, runs automatic
// express will run json.stringify to all the user objects sent
UserSchema.methods.toJSON = function () {
  const user = this;
  const jsonObject = user.toObject();

  delete jsonObject.password;
  delete jsonObject.tokens;
  delete jsonObject.avatar;

  return jsonObject;
};

// middleware to hash password
UserSchema.pre("save", async function (next) {
  const user = this;
  console.log("in middleware of save");
  // console.log(this);

  if (user.isModified(["password"])) {
    const hashpass = await bcryptjs.hash(user.password, 8);
    // const bool = await bcryptjs.compare(pass, hashpass);
    console.log(hashpass);
    user.password = hashpass; // setting password as hashh
    //console.log(user);
  }
  next();
});

//middleware to delete tasks of a deleted user
UserSchema.pre("remove", async function (next) {
  const user = this;

  // remove files.
  await Task.deleteMany({ owner: user._id });
  next();
});

const User = mongoose.model("users", UserSchema); // can save to existing model as well?

module.exports = {
  User,
};

// const me = new User({
//   name: "KL Rahul",
//   email: "KL@gmail.com",
//   age: 28,
//   password: "klthebest1903",
// });

// me.save()
//   .then(() => {
//     console.log("saved");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
