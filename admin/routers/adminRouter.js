const { allUsers } = require("../controllers/allUsers");
const { blockUser } = require("../controllers/blockUserController");
const { login } = require("../controllers/loginController");
const { AdminController } = require("../controllers/adminController");

const router = require("express").Router();

// router.route("/home").post(newRecords);
router.route("/allUsers").post(allUsers);
router.route("/login").post(login);
router.route("/blockUser").post(blockUser);
router.route("/details").get(AdminController.getDetails);
router.route("/addAdmin").post(AdminController.addAdmin);

module.exports = router;
