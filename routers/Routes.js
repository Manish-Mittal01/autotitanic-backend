const router = require("express").Router();
const { upload, uploadFiles } = require("../common/file-upload-controller");
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
router.route("/getUserProfile").get(getUserProfile);
router.route("/updateUserProfile").post(updateUserProfile);
router.route("/changePassword").post(changePassword);
router.route("/sendOtp").post(sendOtp);
//staff auth
router.route("/staffLogin").post(staffLogin);
router.route("/setPassword").post(setPassword);
router.route("/resetStaffPassword").post(resetStaffPassword);
router.route("/getStaffProfile").post(getStaffProfile);
router.route("/changeStaffPassword").post(changeStaffPassword);

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
router.route("/makeList").post(getMakeList);
router.route("/addMake").post(addMake);
router.route("/makeDetails/:id").get(getMakeDetails);
router.route("/updateMake").post(updateMake);
router.route("/deletemake").post(deleteMake);

//model
router.route("/modelList").post(getModelList);
router.route("/addModel").post(addModel);
router.route("/modelDetails/:id").get(getModelDetails);
router.route("/updateModel").post(updateModel);
router.route("/deletemodel").post(deleteModel);

//variant
router.route("/variantList").post(getVariantList);
router.route("/addVariant").post(addVariant);
router.route("/VariantDetails/:id").get(getVariantDetails);
router.route("/updateVariant").post(updateVariant);
router.route("/deleteVariant").post(deleteVariant);

//country
router.route("/countryList").post(getCountriesList);
router.route("/addCountry").post(addCountry);
router.route("/viewCountry/:id").get(getCountryDetails);
router.route("/updateCountry").post(updateCountry);
router.route("/deleteCountry/:countryId").delete(deleteCountry);

//city
router.route("/cityList").post(getCitiesList);
router.route("/addCity").post(addCities);
router.route("/viewCity/:id").get(getCityDetails);
router.route("/updateCity").post(updateCity);
router.route("/deleteCity/:cityId").delete(deleteCity);

// users
router.route("/allUsers").post(allUsers);
router.route("/userStatus").post(blockUser);

//analytics
router.route("/getUserAnalytics").post(getUserAnalytics);
router.route("/getVehicleAnalytics").post(getVehicleAnalytics);

//content-page
router.route("/updateContentPage").post(updateContentPage);
router.route("/addContentPage").post(addContentPage);

//queries
router.route("/addQuery").post(addQuery);
router.route("/allQuery").post(allQuery);
router.route("/getQueryDetails/:id").get(getQueryDetails);
router.route("/updateQuery").post(updateQuery);
router.route("/replyQuery").post(addReplyToQuery);

//banners
router.route("/addBanner").post(addBanner);
router.route("/bannerList").post(bannerList);
router.route("/updateBanner").post(updateBanner);
router.route("/getBanner").post(getBanner);

//roles and permission
router.route("/getRolesList").post(getRolesList);
router.route("/getRoleDetails").post(getRoleDetails);
router.route("/addRole").post(addRole);
router.route("/updateRole").post(updateRole);
router.route("/deleteRole").post(deleteRole);

//staff
router.route("/getStaffList").post(getStaffList);
router.route("/addStaff").post(addStaff);
router.route("/updateStaff").post(updateStaff);
router.route("/deleteStaff").post(deleteStaff);
router.route("/getStaffDetails").post(getStaffDetails);

//common
router.route("/uploadFiles").post(upload.array("images"), uploadFiles);
router.route("/getContentPage/:pageId").get(getContentPage);
router.route("/getContentPageList").get(getContentPageList);
router.route("/sendEmailToUsers").post(sendEmailToUsers);

module.exports = router;
