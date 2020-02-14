const router = require("express").Router();
const { PM } = require("../../utils");
const HospitalController = require("./hospital.controller");
const { SecureAPI, SecureEventAPI } = require("../../utils/secure");
const DonorController = require("../donor/donor.controller");

// router.get("/", SecureAPI(PM.DONOR_LIST), async (req, res, next) => {
//   let single = req.query.single || false;
//   let limit = parseInt(req.query.limit) || 20;
//   let start = parseInt(req.query.start) || 0;
//   let group = req.query.group || null;
//   let requester_phone = req.query.requester_phone || null;
//   let name = req.query.name || null;
//   let address = req.query.address || null;
//   try {
//     if (single) {
//       results = {};
//       if (phone) results = await DonorController.getByPhone(phone);
//       res.json(results);
//     } else {
//       let requests = await RequestController.list({
//         limit,
//         start,
//         group,
//         requester_phone,
//         name,
//         address
//       });
//       res.json(requests);
//     }
//   } catch (e) {
//     console.log(e);
//     res.json(e);
//   }
// });

module.exports = router;
