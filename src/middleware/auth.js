const jwt = require("jsonwebtoken");
const User = require("../models/user").User;
const util = require("util");
const auth = async (req, res, next) => {
  try {
    //console.log(req.headers);
    const token = req.headers["authorization"].replace("Bearer ", ""); // space after beaer imp
    // decode the token

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decodes the token to get the message
    // const user1 = await User.findById({ _id: decoded._id, "tokens.token": token });
    const user1 = await User.findOne({ _id: decoded._id, "tokens.token": token });
    //console.log(user1);

    if (user1 === null) {
      throw new Error("Not valid");
    }

    req.user = user1;
    req.token = token;
    next();
  } catch (error) {
    res.status(400).send("authentication failed");
  }
};

module.exports = auth;
