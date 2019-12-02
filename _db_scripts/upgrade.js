const version = "0.0.1";

const fs = require("fs");
const crypto = require("crypto");
const config = require("config");

const mongoose = require("mongoose");
const dbchanges = require("./dbscripts-" + version);

const Run = async upgradeKey => {
  await mongoose.connect(config.get("db.url"), { useNewUrlParser: true });
  let db = mongoose.connection.db;
  try {
    console.log("-------------- STARTED -----------");
    const cfgFilePath = __dirname + "/cfg.json";

    //To prevent from running this script twice
    let cfg = JSON.parse(fs.readFileSync(cfgFilePath, "utf8"));
    if (upgradeKey != cfg.upgradeKey) throw new Error("Invalid upgrade key");
    if (cfg.lastVersion == version)
      throw new Error(`This version [${version}] script is already ran`);

    await dbchanges(db);
    console.log("=================Done================");

    //change and write a new upgrade key to config file
    fs.writeFileSync(
      cfgFilePath,
      JSON.stringify({
        upgradeKey: crypto
          .randomBytes(10)
          .toString("hex")
          .toUpperCase(),
        lastVersion: version
      }),
      "utf8"
    );
  } catch (e) {
    console.log(e.message);
    console.log("------------- ABORTED ------------");
  } finally {
    //process.exit();
  }
};

if (process.argv < 3) {
  console.log("---------------------------------------");
  console.log("ERROR: Must send upgrade key.\nPlease look into cfg.json");
  console.log("---------------------------------------");
  return;
}

Run(process.argv[2]);
