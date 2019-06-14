const router = require("express").Router();
const config = require("config");
const botRouter = require("./bot");

if (config.has("app.enableSocial")) {
  if (config.get("app.enableSocial")) {
    require("../utils/passport");
  }
}

const uiRouter = require("./ui.routes");
const apiRouter = require("./api.routes");

router.use("/", uiRouter);
router.use("/api/v1", apiRouter);
router.use("/bot", botRouter);
module.exports = router;
