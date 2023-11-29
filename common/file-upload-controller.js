const { initializeApp } = require("firebase/app");
const { firebaseConfig } = require("../firebaseConfig");
const {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} = require("firebase/storage");
const multer = require("multer");
const { ResponseService } = require("./responseService");

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

module.exports.upload = multer({ storage: multer.memoryStorage() });

module.exports.uploadFiles = async (req, res) => {
  try {
    // console.log("req file", req.file);
    const storageRef = ref(
      storage,
      `autotitanic/${req.file.originalname}/${Date.now()}`
    );
    const metaData = {
      contentType: req.file.mimetype,
    };
    const snapShot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metaData
    );

    const downloadURL = await getDownloadURL(snapShot.ref);

    const responseData = {
      url: downloadURL,
    };
    return ResponseService.success(res, "File uploaded", responseData);
  } catch (error) {
    console.log("file upload error", error);
    return ResponseService.failed(res, `Error in uploading the files ${error}`);
  }
};
