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
  getAllModel,
} = require("../admin/controllers/ModelController");
const {
  getAllModels,
  getModelList,
} = require("../user/controllers/ModelController");
const {
  login,
  register,
  resetPassword,
} = require("../user/controllers/authController");
const {
  getAllCountries,
  addCountry,
  updateCountry,
  getCountryDetails,
  deleteCountry,
} = require("../admin/controllers/countryController");
const {
  addCities,
  getAllCities,
  getCityDetails,
  updateCity,
  deleteCity,
} = require("../admin/controllers/cityController");
const { getMakeList } = require("../user/controllers/makeController");

//auth
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/resetPassword").post(resetPassword);

//user
router.route("/allModel/:makeId").get(getModelList);
router.route("/allMake").get(getMakeList);
router.route("/getResultCount").post(getResultCount);
router.route("/allVehicles").post(getAllvehicles);
router.route("/addVehicle").post(addVehicle);

//admin
//make
router.route("/makeList").get(getAllMake);
router.route("/addMake").post(addMake);
router.route("/makeDetails/:id").get(getMakeDetails);
router.route("/updateMake").post(updateMake);
router.route("/deletemake").post(deleteMake);

//model
router.route("/modelList").get(getAllModel);
router.route("/addModel").post(addModel);
router.route("/modelDetails/:id").get(getModelDetails);
router.route("/updateModel").post(updateModel);
router.route("/deletemodel").post(deleteModel);

//country
router.route("/addCountry").post(addCountry);
router.route("/allCountry").get(getAllCountries);
router.route("/viewCountry/:id").get(getCountryDetails);
router.route("/updateCountry").post(updateCountry);
router.route("/deleteCountry/:countryId").delete(deleteCountry);

//city
router.route("/addCity").post(addCities);
router.route("/allCity").get(getAllCities);
router.route("/viewCity/:id").get(getCityDetails);
router.route("/updateCity").post(updateCity);
router.route("/deleteCity/:cityId").delete(deleteCity);
// router.route("/addUser").post(addUser);

//common
router.route("/uploadFiles").post(upload.array("images"), uploadFiles);

module.exports = router;
