const router = require("express").Router();
const { addUser } = require("../user/controllers/userController");
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
  getResultCount,
} = require("../user/controllers/vehicleController");
const {
  addModel,
  getModelDetails,
  updateModel,
  deleteModel,
} = require("../admin/controllers/ModelController");
const { getAllModels } = require("../user/controllers/ModelController");
const {
  login,
  register,
  resetPassword,
} = require("../user/controllers/authController");
const {
  getAllCountries,
  addCountry,
} = require("../admin/controllers/countryController");

//auth
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/resetPassword").post(resetPassword);

//user
router.route("/allVehicles").post(getAllvehicles);
router.route("/addVehicle").post(addVehicle);
router.route("/getResultCount").post(getResultCount);

//admin
router.route("/addMake").post(addMake);
router.route("/makeDetails/:id").get(getMakeDetails);
router.route("/updateMake").post(updateMake);
router.route("/deletemake").post(deleteMake);
router.route("/addModel").post(addModel);
router.route("/allModel/:makeId").get(getAllModels);
router.route("/modelDetails/:id").get(getModelDetails);
router.route("/updateModel").post(updateModel);
router.route("/deletemodel").post(deleteModel);
router.route("/addCountry").post(addCountry);
router.route("/allCountry").get(getAllCountries);
router.route("/viewCountry/:id").get(getModelDetails);
router.route("/updateCountry").post(updateModel);
router.route("/deleteCountry").post(deleteModel);
// router.route("/addUser").post(addUser);

//common
router.route("/uploadFiles").post(upload.array("images"), uploadFiles);
router.route("/allMake").get(getAllMake);

module.exports = router;
