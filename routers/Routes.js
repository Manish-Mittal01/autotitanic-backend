const router = require("express").Router();
const {
  login,
  register,
  sendOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  changePassword,
  verifyEmail,
  resendVerificationEmail,
} = require("../auth/authController");

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
  getVehicleDetails,
  updateVehicle,
  deleteVehicle,
  makeOffer,
  getResultCountByFilter,
  getRelatedvehicles,
} = require("../user/controllers/vehicleController");

// user import
const { getAllMake } = require("../user/controllers/makeController");
const { getAllModel } = require("../user/controllers/ModelController");
const { getAllCountries, getAllCities } = require("../user/controllers/locationController");
const {
  getVariantList,
  addVariant,
  getVariantDetails,
  updateVariant,
  deleteVariant,
} = require("../admin/controllers/variantController");
const { getAllVariant } = require("../user/controllers/variantController");
const {
  updateContentPage,
  addContentPage,
  getContentPage,
  getContentPageList,
} = require("../admin/controllers/contentPagesController");
const { sendMail } = require("../common/firebaseMailer");
const {
  addToCompare,
  getCompareList,
  removeCompareListItem,
} = require("../user/controllers/compareController");
const {
  addToWishlist,
  removewishlistItem,
  getWishlist,
} = require("../user/controllers/wishlistController");
const {
  uploadMake,
  uploadCountryAndCity,
  uploadCurrencyAndCode,
  updateData,
  uploadModel,
} = require("../common/dataUploadFunctions");
const { allUsers, blockUser, sendEmailToUsers } = require("../admin/controllers/userController");
const {
  getUserAnalytics,
  getVehicleAnalytics,
} = require("../admin/controllers/analyticsController");
const {
  addReview,
  getReviews,
  manageLikes,
  addReply,
  getAllReply,
  manageLikesOnreply,
} = require("../user/controllers/reviewController");
const { addQuery } = require("../user/controllers/queryController");
const {
  allQuery,
  updateQuery,
  addReplyToQuery,
  getQueryDetails,
} = require("../admin/controllers/queryController");
const {
  addBanner,
  bannerList,
  updateBanner,
  getBanner,
} = require("../admin/controllers/bannerController");
const {
  addRole,
  getRolesList,
  updateRole,
  deleteRole,
  getRoleDetails,
} = require("../admin/controllers/rolesController");
const {
  addStaff,
  updateStaff,
  deleteStaff,
  getStaffList,
  getStaffDetails,
} = require("../admin/controllers/staffController");
const {
  staffLogin,
  setPassword,
  resetStaffPassword,
  getStaffProfile,
  changeStaffPassword,
} = require("../auth/staffAuth");
const { validateStaffToken, validateUserToken } = require("../middlewares/authCheck");
const { upload } = require("../utils/multer");
const { uploadFiles } = require("../common/file-upload-controller");

//other functions
router.route("/uploadMake").get(uploadMake);
router.route("/uploadModel").get(uploadModel);
router.route("/uploadCountryAndCity").get(uploadCountryAndCity);
router.route("/uploadCurrencyAndCode").get(uploadCurrencyAndCode);
router.route("/updateData").get(updateData);

//auth
router.route("/register").post(register);
router.route("/verifyEmail").post(verifyEmail);
router.route("/resendVerificationEmail").post(resendVerificationEmail);
router.route("/login").post(login);
router.route("/resetPassword").post(resetPassword);
router.route("/getUserProfile").get(validateUserToken, getUserProfile);
router.route("/updateUserProfile").post(validateUserToken, updateUserProfile);
router.route("/changePassword").post(validateUserToken, changePassword);
router.route("/sendOtp").post(sendOtp);

//staff auth
router.route("/staffLogin").post(staffLogin);
router.route("/setPassword").post(setPassword);
router.route("/resetStaffPassword").post(resetStaffPassword);
router.route("/getStaffProfile").post(validateStaffToken, getStaffProfile);
router.route("/changeStaffPassword").post(validateStaffToken, changeStaffPassword);

//user
//filters
router.route("/allMake").get(getAllMake);
router.route("/allModel/:makeId").get(getAllModel);
router.route("/allVariant/:modelId").get(getAllVariant);
router.route("/allCountry").get(getAllCountries);
router.route("/allCities/:countryId").get(getAllCities);

//vehicle
router.route("/getResultCount").post(getResultCount);
router.route("/getResultCountByFilter").post(getResultCountByFilter);
router.route("/allVehicles").post(getAllvehicles);
router.route("/addVehicle").post(addVehicle);
router.route("/vehicleDetails/:vehicleId").get(getVehicleDetails);
router.route("/updateVehicle/:id").post(updateVehicle);
router.route("/deleteVehicle/:id").post(deleteVehicle);
router.route("/makeOffer").post(makeOffer);
router.route("/getRelatedvehicles").post(getRelatedvehicles);

//Review
router.route("/addReview").post(addReview);
router.route("/getReviews").post(getReviews);
router.route("/manageLikes").post(manageLikes);
router.route("/manageLikes/reply").post(manageLikesOnreply);
router.route("/addReply").post(addReply);
router.route("/getAllReply").post(getAllReply);

//user compare list
router.route("/addToCompare").post(addToCompare);
router.route("/getCompareList").get(getCompareList);
router.route("/removeCompareListItem").post(removeCompareListItem);

//user wishlist
router.route("/addToWishlist").post(addToWishlist);
router.route("/getWishlist").post(getWishlist);
router.route("/removewishlistItem").post(removewishlistItem);

//admin
//make
router.route("/makeList").post(validateStaffToken, getMakeList);
router.route("/addMake").post(validateStaffToken, addMake);
router.route("/makeDetails/:id").get(validateStaffToken, getMakeDetails);
router.route("/updateMake").post(validateStaffToken, updateMake);
router.route("/deletemake").post(validateStaffToken, deleteMake);

//model
router.route("/modelList").post(validateStaffToken, getModelList);
router.route("/addModel").post(validateStaffToken, addModel);
router.route("/modelDetails/:id").get(validateStaffToken, getModelDetails);
router.route("/updateModel").post(validateStaffToken, updateModel);
router.route("/deletemodel").post(validateStaffToken, deleteModel);

//variant
router.route("/variantList").post(validateStaffToken, getVariantList);
router.route("/addVariant").post(validateStaffToken, addVariant);
router.route("/VariantDetails/:id").get(validateStaffToken, getVariantDetails);
router.route("/updateVariant").post(validateStaffToken, updateVariant);
router.route("/deleteVariant").post(validateStaffToken, deleteVariant);

//country
router.route("/countryList").post(validateStaffToken, getCountriesList);
router.route("/addCountry").post(validateStaffToken, addCountry);
router.route("/viewCountry/:id").get(validateStaffToken, getCountryDetails);
router.route("/updateCountry").post(validateStaffToken, updateCountry);
router.route("/deleteCountry/:countryId").delete(validateStaffToken, deleteCountry);

//city
router.route("/cityList").post(validateStaffToken, getCitiesList);
router.route("/addCity").post(validateStaffToken, addCities);
router.route("/viewCity/:id").get(validateStaffToken, getCityDetails);
router.route("/updateCity").post(validateStaffToken, updateCity);
router.route("/deleteCity/:cityId").delete(validateStaffToken, deleteCity);

// users
router.route("/allUsers").post(validateStaffToken, allUsers);
router.route("/userStatus").post(validateStaffToken, blockUser);

//analytics
router.route("/getUserAnalytics").post(validateStaffToken, getUserAnalytics);
router.route("/getVehicleAnalytics").post(validateStaffToken, getVehicleAnalytics);

//content-page
router.route("/updateContentPage").post(validateStaffToken, updateContentPage);
router.route("/addContentPage").post(validateStaffToken, addContentPage);

//queries
router.route("/addQuery").post(addQuery);
router.route("/allQuery").post(validateStaffToken, allQuery);
router.route("/getQueryDetails/:id").get(validateStaffToken, getQueryDetails);
router.route("/updateQuery").post(validateStaffToken, updateQuery);
router.route("/replyQuery").post(validateStaffToken, addReplyToQuery);

//banners
router.route("/addBanner").post(validateStaffToken, addBanner);
router.route("/bannerList").post(validateStaffToken, bannerList);
router.route("/updateBanner").post(validateStaffToken, updateBanner);
router.route("/getBanner").post(getBanner);

//roles and permission
router.route("/getRolesList").post(validateStaffToken, getRolesList);
router.route("/getRoleDetails").post(validateStaffToken, getRoleDetails);
router.route("/addRole").post(validateStaffToken, addRole);
router.route("/updateRole").post(validateStaffToken, updateRole);
router.route("/deleteRole").post(validateStaffToken, deleteRole);

//staff
router.route("/getStaffList").post(validateStaffToken, getStaffList);
router.route("/addStaff").post(validateStaffToken, addStaff);
router.route("/updateStaff").post(validateStaffToken, updateStaff);
router.route("/deleteStaff").post(validateStaffToken, deleteStaff);
router.route("/getStaffDetails").post(validateStaffToken, getStaffDetails);

//common
router.route("/uploadFiles").post(upload.array("images"), uploadFiles);
router.route("/getContentPage/:pageId").get(getContentPage);
router.route("/getContentPageList").get(getContentPageList);
router.route("/sendEmailToUsers").post(sendEmailToUsers);

module.exports = router;
