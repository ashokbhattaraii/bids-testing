const fs = require("fs");
const router = require("express").Router();

const { WebhookClient } = require("dialogflow-fulfillment");
const { dialogflow, Image } = require("actions-on-google");

const RequestBot = require("../../modules/request/request.bot");
const DonorBot = require("../../modules/donor/donor.bot");
const app = dialogflow();

router.get("/", (req, res, next) => {
  res.json({ message: "Hello from Bot. Please only use POST requests" });
});
router.post("/", async (req, res, next) => {
  const agent = new WebhookClient({ request: req, response: res });

  const donorBot = new DonorBot(agent);
  const requestBot = new RequestBot(agent);

  let obj = {
    "Default Welcome Intent": () => requestBot.welcomeResponse(),
    RequestHandlerIntent: () => requestBot.queryBlood()
  };

  agent.handleRequest(obj[agent.intent]);
});

module.exports = router;
