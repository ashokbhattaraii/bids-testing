const router = require("express").Router();

const rolesRouter = require("../modules/role/role.routes.api");
const usersRouter = require("../modules/user/user.routes.api");
const settingRouter = require("../modules/setting/setting.routes.api");
const staticRouter = require("../modules/setting/static.routes.api");
const donorRouter = require("../modules/donor/donor.routes.api");

router.use("/roles", rolesRouter);
router.use("/users", usersRouter);
router.use("/setttings", settingRouter);
router.use("/static", staticRouter);
router.use("/donors", donorRouter);

module.exports = router;
