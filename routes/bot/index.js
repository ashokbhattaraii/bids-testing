const router = require("express").Router();
const dialogflow = require("./bot.dialogflow");

router.use("/dialogflow", dialogflow);

module.exports = router;
