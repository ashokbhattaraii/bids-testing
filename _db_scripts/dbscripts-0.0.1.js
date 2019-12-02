const mongoose = require("mongoose");

const DbScripts = async db => {
  await db.collection("donors").rename("donors_static");
};

module.exports = DbScripts;
