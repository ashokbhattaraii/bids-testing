const router = require("express").Router();
const { SecureUI } = require("../utils/secure");
const AuthRouter = require("./ui.routes.auth");
const RoleRouter = require("../modules/role/role.routes.ui");
const SettingController = require("../modules/setting/setting.controller");
const UserRouter = require("../modules/user/user.routes.ui");
const DonorRouter = require("../modules/donor/donor.routes.ui");
const RequestRouter = require("../modules/request/request.routes.ui");

const config = require("config");
const s3policy = require("../utils/s3Policy")(config.get("services.aws_s3"));

/* GET home page. */
router.get("/", SecureUI(), (req, res, next) => {
  res.redirect("/requests");
});

router.get("/app", async (req, res, next) => {
  let settings = await SettingController.get();
  res.render("app", {
    settings
  });
});

router.get("/settings", SecureUI(), (req, res, next) => {
  res.render("misc/settings", { title: "Settings" });
});

router.post("/misc/s3policy", (req, res, next) => {
  if (!req.body.type) throw Error("Must send document type");
  let startsWith = null;
  if (req.body.type === "req_form") startsWith = `bids/req_forms/`;

  res.json(
    s3policy.get({
      startsWith
    })
  );
});

router.use("/", AuthRouter);
router.use("/users", UserRouter);
router.use("/roles", RoleRouter);
router.use("/donors", DonorRouter);
router.use("/requests", RequestRouter);

module.exports = router;
