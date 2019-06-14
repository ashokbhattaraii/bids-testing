const DonorController = require("./donor.controller");
const { Text, Card, Image, Suggestion, Payload } = require("dialogflow-fulfillment");

const { ERR } = require("../../utils/");

class DonorBot {
  constructor(agent) {
    this.agent = agent;
  }

  queryBlood() {
    const blood = this.agent.parameters["blood"];
    if (!blood) {
      this.agent.add("Please enter a blood group");
    } else {
      this.agent.add("blood is available");
    }
  }
}

module.exports = DonorBot;
