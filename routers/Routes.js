const router = require("express").Router();
const { addUser } = require("../user/controllers/userController");
const { login } = require("../user/controllers/loginController");
const { register } = require("../user/controllers/registerController");
const { upload, uploadFiles } = require("../common/file-upload-controller");
const {
  addMake,
  getAllMake,
  deleteMake,
  updateMake,
  getMakeDetails,
} = require("../admin/controllers/makeController");
const {
  getAllvehicles,
  addVehicle,
} = require("../user/controllers/vehicleController");
const {
  getAllModels,
  addModel,
  getModelDetails,
  updateModel,
  deleteModel,
} = require("../admin/controllers/ModelController");

// router.route("/login").post(login);
// router.route("/register").post(register);
// router.route("/addUser").post(addUser);
router.route("/uploadFiles").post(upload.array("images"), uploadFiles);
router.route("/addMake").post(addMake);
router.route("/allMake").get(getAllMake);
router.route("/makeDetails/:id").get(getMakeDetails);
router.route("/updateMake").post(updateMake);
router.route("/deletemake").post(deleteMake);
router.route("/addModel").post(addModel);
router.route("/allModel").get(getAllModels);
router.route("/modelDetails/:id").get(getModelDetails);
router.route("/updateModel").post(updateModel);
router.route("/deletemodel").post(deleteModel);
router.route("/allVehicles").get(getAllvehicles);
router.route("/vehicle/add").post(addVehicle);

module.exports = router;
