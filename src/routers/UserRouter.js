const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const User = require("../models/user").User;
const multer = require("multer");
const sharp = require("sharp"); //image manipulation

//create resource
router.post("/users", async (req, res) => {
  const U1 = new User(req.body);

  //   U1.save()
  //     .then(() => {
  //       console.log("saved user");
  //       res.status(201).send("Ok");
  //     })
  //     .catch((err) => {
  //       res.status(400); // if client side error
  //       res.send(err);
  //     });

  try {
    await U1.save();
    // need to add tokens before saving
    const token = await U1.generateAuthtoken();

    console.log("saved user");
    res.status(201).send({ U1, token }); //advantage when multiple await
  } catch (error) {
    res.status(400); // if client side error
    res.send(error);
  }
});

//users
router.get("/users/me", auth, async (req, res) => {
  try {
    // const data = await User.find(); // will return data promise
    // res.status(200).send(data);

    //just using middleware to send person's profile
    res.send(req.user);
    console.log("got personel");
  } catch (error) {
    res.status(500).send(error); // because server error
  }
});
//user id --> removed after authentication
// router.get("/users/:id", async (req, res) => {
//   const id = req.params.id;

//   try {
//     const data = await User.findById(id);

//     if (!data) {
//       return res.status(400).send("task not found");
//     }
//     res.status(201).send(data);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

// updating

router.patch("/users/me", auth, async (req, res) => {
  const _id = req.user._id;
  //validating updates
  const updates = Object.keys(req.body); // gives array string with keys
  const allowedupdates = ["age", "email", "password"]; //not name

  const isValidupdate = updates.every((update) => allowedupdates.includes(update)); // returns true if all are allowed updates

  if (!isValidupdate) {
    return res.status(400).send("invalid updates");
  }
  try {
    // const user_new = await User.findByIdAndUpdate(_id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    //const user = await User.findById(_id);
    const user = req.user;
    updates.forEach((update) => {
      user[update] = req.body[update]; //dynamic setting
    });

    await user.save(); // so i can use midlleware
    console.log(user);
    if (!user) {
      return res.status(400).send("Can't Find User");
    }
    console.log(user);
    res.send(user);
  } catch (error) {
    res.send(error);
  }
});

// Delete
router.delete("/users/me", auth, async (req, res) => {
  //checck path url
  // const _id = req.params.id;

  try {
    // const user = await User.findByIdAndDelete(_id);
    // if (!user) {
    //   return res.status(400).send("no user found");
    // }

    await req.user.remove();
    // use middleware o delete files
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

//router login

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password); // define this in the static of schema

    //returning jwt
    const token = await user.generateAuthtoken(); //specific to a user

    res.send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/logout", auth, async (req, res) => {
  // when logging out, remove the auth token from the token array

  //removing token
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    //saving changes to user
    await req.user.save();
    res.send("logged out");
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("logged out from all devices");
  } catch (error) {
    res.status(400).send(error);
  }
});

//multer setting
const storage = multer.memoryStorage();
const upload = multer({
  dest: "avatars",
  limits: {
    fileSize: 1000000, //1 mb size
  },
  fileFilter(req, file, cb) {
    // regular expression js
    if (file.originalname.match(/\.(doc||docx||pdf)$/)) {
      return cb(new Error("Please upload jpg/jpeg/png"));
    }
    return cb(undefined, true); // all fine
  },
  storage,
});

router.post(
  "/user/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();

    res.send();
  }, //now error handler to send json messages
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.delete(
  "/user/me/avatar",
  auth,
  async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();

    res.send();
  }, //now error handler to send json messages
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

router.get("/user/:id/avatar", async (req, res) => {
  const user = await User.findById(req.params.id);
  //console.log(user.avatar);
  try {
    // console.log(user.avatar);
    if (!user || !user.avatar) {
      throw new Error("no pic");
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = { router };
