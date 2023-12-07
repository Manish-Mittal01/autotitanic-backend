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
const { StatusCode } = require("./Constants");

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

module.exports.upload = multer({ storage: multer.memoryStorage() });

module.exports.uploadFiles = async (req, res) => {
  try {
    const files = req.file ? [req.file] : req.files;
    let downloadURLs = [];

    if (!files)
      return ResponseService.failed(
        res,
        "images not found",
        StatusCode.notFound
      );

    for (let file of files) {
      if (file.mimetype.split("/")[0] !== "image")
        return ResponseService.failed(
          res,
          "Only images are allowed",
          StatusCode.badRequest
        );
      const storageRef = ref(
        storage,
        `autotitanic/${file.originalname}/${Date.now()}`
      );
      const metaData = {
        contentType: file.mimetype,
      };
      const snapShot = await uploadBytesResumable(
        storageRef,
        file.buffer,
        metaData
      );

      const downloadURL = await getDownloadURL(snapShot.ref);
      downloadURLs.push({ url: downloadURL, type: file.mimetype });
    }

    const responseData = [...downloadURLs];
    return ResponseService.success(res, "File uploaded", responseData);
  } catch (error) {
    console.log("file upload error", error);
    return ResponseService.failed(res, `Error in uploading the files ${error}`);
  }
};
