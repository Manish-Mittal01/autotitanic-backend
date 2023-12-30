const { initializeApp } = require("firebase/app");
const SharpMulter = require("sharp-multer");
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
const path = require("path");
const fs = require("fs");
const makeModel = require("../Models/makeModel");

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// const newStorage = SharpMulter({
//   destination: storage,
//   imageOptions: {
//     fileFormat: "jpg",
//     quality: 80,
//   },
// });

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

module.exports.uploadAllMake = async (req, res) => {
  try {
    const dir = path.join(__dirname, "..", "..", "images", "make logos");
    const fileList = fs.readdirSync(dir);

    const downloadUrls = [];

    for (let file of fileList) {
      const split = file.split(".");
      const imageType = split.pop();
      const label = split.join();

      console.log("imageType", imageType);

      const filename = dir + "/" + file;
      const fileBuffer = fs.readFileSync(filename);

      const storageRef = ref(storage, `autotitanic/${file}/${Date.now()}`);
      const metatype = {
        contentType: `image/${imageType}`,
      };

      const uploadTask = await uploadBytesResumable(
        storageRef,
        fileBuffer,
        metatype
      );

      const downloadUrl = await getDownloadURL(uploadTask.ref);
      downloadUrls.push(downloadUrl);
      const newMake = { label, type: ["cars"], logo: downloadUrl };
      const make = new makeModel(newMake);
      const result = await make.save();
    }

    return res.send({
      status: 200,
      data: downloadUrls,
    });
  } catch (error) {
    console.log("file upload error", error);
    return ResponseService.failed(res, `Error in uploading the files ${error}`);
  }
};
