const DonorController = require("../donor/donor.controller");
const RequestController = require("./request.controller");
const { Text, Card, Image, Suggestion, Payload } = require("dialogflow-fulfillment");

const { ERR } = require("../../utils/");

class RequestBot {
  constructor(agent) {
    this.agent = agent;
  }

  welcomeResponse() {
    try {
      const quickReplies = new Suggestion();
      quickReplies.addReply_("A+");
      quickReplies.addReply_("A-");
      quickReplies.addReply_("B+");
      quickReplies.addReply_("B-");
      quickReplies.addReply_("O+");
      quickReplies.addReply_("O-");
      quickReplies.addReply_("AB+");
      quickReplies.addReply_("AB-");
      this.agent.context.set({
        name: "context-name",
        lifespan: 5,
        parameters: {
          "parameter-name": "parameter-value"
        }
      });
      this.agent.add(quickReplies);
    } catch (e) {
      throw new Error(e);
    }
  }

  async queryBlood() {
    let context = this.agent.context.get("bloodgroup");
    // console.log("context is ", context);
    if (
      context.parameters.blood &&
      context.parameters.requester_name &&
      context.parameters.requester_phone &&
      context.parameters.requester_address &&
      context.parameters.patient_name &&
      context.parameters.hospital
    ) {
      let payload = {
        blood_group: RequestController.splitBlood(context.parameters.blood).group,
        rh_factor: RequestController.splitBlood(context.parameters.blood).rh_factor,
        requester_name: context.parameters.requester_name,
        requester_phone: context.parameters.requester_phone,
        address: context.parameters.requester_address,
        patient_name: context.parameters.patient_name,
        hospital: context.parameters.hospital,
        source: "bot"
      };

      await RequestController.save(payload);

      this.agent.add(
        "Thanks for using BIDS request system. We'll get back to you shortly. #hamrolifebank #smartblood."
      );
    } else {
      const quickReplies = new Suggestion({
        title: "your request was not fullfilled try again"
      });
      quickReplies.addReply_("A+");
      quickReplies.addReply_("A-");
      quickReplies.addReply_("B+");
      quickReplies.addReply_("B-");
      quickReplies.addReply_("O+");
      quickReplies.addReply_("O-");
      quickReplies.addReply_("AB+");
      quickReplies.addReply_("AB-");
      this.agent.context.set({
        name: "context-name",
        lifespan: 5,
        parameters: {
          "parameter-name": "parameter-value"
        }
      });
      this.agent.add(quickReplies);
    }
  }

  addRequest() {
    try {
      const name = this.agent;
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = RequestBot;
