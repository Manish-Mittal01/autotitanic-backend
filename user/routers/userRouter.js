const router = require("express").Router();
const { addUser } = require("../controllers/userController");
const { login } = require("../controllers/loginController");
const { register } = require("../controllers/registerController");
const { upload, uploadFiles } = require("../../common/file-upload-controller");
const {
  brandController,
  getAllBrands,
} = require("../controllers/brandController");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/addUser").post(addUser);
router.route("/uploadFiles").post(upload.any("images"), uploadFiles);
router.route("/addBrand").post(brandController);
router.route("/allBrands").get(getAllBrands);

module.exports = router;
