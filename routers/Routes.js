const router = require("express").Router();
const { addUser } = require("../user/controllers/userController");
const { upload, uploadFiles } = require("../common/file-upload-controller");
const {
  login,
  register,
  resetPassword,
} = require("../user/controllers/authController");

//admin import
const {
  addMake,
  getMakeList,
  deleteMake,
  updateMake,
  getMakeDetails,
} = require("../admin/controllers/makeController");
const {
  addModel,
  getModelDetails,
  updateModel,
  deleteModel,
  getModelList,
} = require("../admin/controllers/ModelController");
const {
  getCountriesList,
  addCountry,
  updateCountry,
  getCountryDetails,
  deleteCountry,
} = require("../admin/controllers/countryController");
const {
  addCities,
  getCitiesList,
  getCityDetails,
  updateCity,
  deleteCity,
} = require("../admin/controllers/cityController");
const {
  getAllvehicles,
  addVehicle,
  getResultCount,
} = require("../user/controllers/vehicleController");

// user import
const { getAllMake } = require("../user/controllers/makeController");
const { getAllModel } = require("../user/controllers/ModelController");
const {
  getAllCountries,
  getAllCities,
} = require("../user/controllers/locationController");

//auth
router.route("/login").post(login);
router.route("/register").post(register);
router.route("/resetPassword").post(resetPassword);

//user
router.route("/allMake").get(getAllMake);
router.route("/allModel/:makeId").get(getAllModel);
router.route("/allCountry").get(getAllCountries);
router.route("/allCities").get(getAllCities);
router.route("/getResultCount").post(getResultCount);
router.route("/allVehicles").post(getAllvehicles);
router.route("/addVehicle").post(addVehicle);

//admin
//make
router.route("/makeList").get(getMakeList);
router.route("/addMake").post(addMake);
router.route("/makeDetails/:id").get(getMakeDetails);
router.route("/updateMake").post(updateMake);
router.route("/deletemake").post(deleteMake);

//model
router.route("/modelList").get(getModelList);
router.route("/addModel").post(addModel);
router.route("/modelDetails/:id").get(getModelDetails);
router.route("/updateModel").post(updateModel);
router.route("/deletemodel").post(deleteModel);

//country
router.route("/countryList").get(getCountriesList);
router.route("/addCountry").post(addCountry);
router.route("/viewCountry/:id").get(getCountryDetails);
router.route("/updateCountry").post(updateCountry);
router.route("/deleteCountry/:countryId").delete(deleteCountry);

//city
router.route("/cityList").get(getCitiesList);
router.route("/addCity").post(addCities);
router.route("/viewCity/:id").get(getCityDetails);
router.route("/updateCity").post(updateCity);
router.route("/deleteCity/:cityId").delete(deleteCity);
// router.route("/addUser").post(addUser);

//common
router.route("/uploadFiles").post(upload.array("images"), uploadFiles);

module.exports = router;
