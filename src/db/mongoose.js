const mongoose = require("mongoose");

const connectionURL = process.env.MONGODB_URL;
// const DataBaseName = "task-manager-api";

mongoose.connect(connectionURL); //this async but mongoose handles
