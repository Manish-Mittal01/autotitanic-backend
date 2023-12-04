const router = require("express").Router();
const { addUser } = require("../controllers/userController");
const { login } = require("../controllers/loginController");
const { register } = require("../controllers/registerController");
const { upload, uploadFiles } = require("../../common/file-upload-controller");
const {
  brandController,
  getAllBrands,
} = require("../controllers/brandController");
const {
  getAllvehicles,
  addVehicle,
} = require("../controllers/vehicleController");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/addUser").post(addUser);
router.route("/uploadFiles").post(upload.any("images"), uploadFiles);
router.route("/addBrand").post(brandController);
router.route("/allBrands").get(getAllBrands);
router.route("/allVehicles").get(getAllvehicles);
router.route("/vehicle/add").post(addVehicle);

module.exports = router;
