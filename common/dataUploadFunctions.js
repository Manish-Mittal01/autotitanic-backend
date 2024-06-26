const allModels = require("../Models/allModels");
const countryModel = require("../Models/countryModel");
const makeModel = require("../Models/makeModel");
const { StatusCode } = require("./Constants");
const { ResponseService } = require("./responseService");
const { makeAndModels } = require("./jsonData");
const { countryAndCity } = require("./jsonData");
const { currencyAndCode } = require("./jsonData");
const cityModel = require("../Models/cityModel");
const vehiclesModel = require("../Models/vehiclesModel");

module.exports.uploadMake = async (req, res) => {
  try {
    const allMake = await makeModel.find({ type: "cars" }).lean();

    //   Person.update({'items.id': 2}, {'$set': {
    //     'items.$.name': 'updated item2',
    //     'items.$.value': 'two updated'
    // }},

    // const makes = Object.keys(makeAndModels);

    // for (let make of makes) {
    //   const myMake = allMake.find((oldMake) => oldMake.label === make);

    //   if (myMake) {
    //     const result = await makeModel.updateOne(
    //       { _id: myMake._id },
    //       { $push: { type: "plants" } }
    //     );
    //   } else {
    //     const label = make.toString();
    //     const type = ["plants"];

    //     const newMake = { label, type };
    //     const verifiedMake = new makeModel(newMake);

    //     const result = await verifiedMake.save();
    //   }
    // }

    const myMake = await makeModel
      .findOne({
        label: "Volkswagen",
        // type: "vans",
      })
      .lean();
    console.log("myMake", myMake);
    if (!myMake) return ResponseService.failed(res, "make not found", StatusCode.failed);

    // Mercedes-Benz
    // Toyota
    // Volkswagen
    // Citroen
    // Fiat
    // Ford
    // IVECO
    // Peugeot
    // Vauxhall

    // if (myMake.isPopular) {
    //   console.log("first");
    //   const result = await makeModel.updateOne(
    //     { _id: myMake._id },
    //     {
    //       $push: {
    //         isPopular: "vans",
    //         type: "vans",
    //       },
    //     }
    //   );
    // } else {
    //   console.log("sec");
    //   const result = await makeModel.updateOne(
    //     { _id: myMake._id },
    //     { $set: { isPopular: ["vans"] } }
    //   );
    // }

    const updatedMakes = await makeModel.find({ type: "vans", isPopular: "vans" }).lean();

    return ResponseService.success(res, "Updated", {
      items: updatedMakes,
      // count: updatedMakes.length,
    });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports.uploadModel = async (req, res) => {
  try {
    const allMake = await makeModel.find({ type: "plants" }).lean();

    //   Person.update({'items.id': 2}, {'$set': {
    //     'items.$.name': 'updated item2',
    //     'items.$.value': 'two updated'
    // }},

    // PersonModel.update({ _id: person._id }, { $push: { friends: friend } }, done);

    const makes = Object.keys(makeAndModels);

    for (let make of makes) {
      const myMake = allMake.find((oldMake) => oldMake.label === make);

      if (myMake) {
        for (let model of makeAndModels[make]) {
          const makeId = myMake?._id;
          const label = model.toString();

          const myModel = await allModels.findOne({ label: label, make: makeId });

          console.log("myModel", myModel);

          // if (myModel) {
          //   console.log("Model exist", myModel);
          // } else {
          //   const newModel = { label, make: makeId, type: ["plants"] };
          //   const mymodel = new allModels(newModel);

          //   const result = await mymodel.save();
          // }
        }
      } else {
        console.log("make not found", make);
      }
    }

    const allModel = await allModels.find({ type: "plants" }).lean();
    const allModelCount = await allModels.countDocuments({ type: "plants" });

    // console.log("allMake", allMake);

    return ResponseService.success(res, "Updated", { items: allModel, count: allModelCount });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports.uploadCountryAndCity = async (req, res) => {
  try {
    const allCountries = await countryModel.find().lean();

    const countries = Object.keys(countryAndCity);
    for (let country of countries) {
      // const myCountry = await countryModel.findOne({ name: country });
      const myCountry = allCountries.find((oldCountry) => oldCountry.name === country);

      if (myCountry) {
        const countryId = myCountry?._id;
        for (let city of countryAndCity[country]) {
          const name = city.toString();

          const newCity = { name, country: countryId };
          const myCity = new cityModel(newCity);

          const isCityExist = await cityModel.findOne({
            name: name,
            country: countryId,
          });

          if (!isCityExist) {
            const result = await myCity.save();
          }
        }
      }
    }

    const citiesList = await cityModel.find().lean();
    const cityCount = await cityModel.countDocuments();

    // console.log("allMake", allMake);

    return ResponseService.success(res, "Updated", { items: citiesList, count: cityCount });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports.uploadCurrencyAndCode = async (req, res) => {
  try {
    const allCountries = await countryModel.find().lean();

    const countries = Object.keys(currencyAndCode);
    for (let country of countries) {
      const myCountry = allCountries.find((oldCountry) => oldCountry.name === country);

      if (myCountry) {
        const countryId = myCountry?._id;
        let code = currencyAndCode[country].code;

        const result = await countryModel.updateOne({ _id: countryId }, { countryCode: code });
      }
    }

    const countriesLst = await countryModel.find().lean();

    // console.log("allMake", allMake);

    return ResponseService.success(res, "Updated", { items: countriesLst });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports.updateData = async (req, res) => {
  try {
    // const allVehicles = await vehiclesModel.find({ status: "approve" });

    const result = await vehiclesModel.updateMany({ status: "approve" }, { status: "approved" });

    const allVehicles = await vehiclesModel.find({ status: "approve" });

    console.log("allVehicles", allVehicles);

    return ResponseService.success(res, result, StatusCode.success);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, error.message, StatusCode.srevrError);
  }
};

// module.exports.uploadAllMake = async (req, res) => {
//   try {
//     const dir = path.join(__dirname, "..", "..", "images", "make logos");
//     const fileList = fs.readdirSync(dir);

//     const downloadUrls = [];

//     for (let file of fileList) {
//       const split = file.split(".");
//       const imageType = split.pop();
//       const label = split.join();

//       console.log("imageType", imageType);

//       const filename = dir + "/" + file;
//       const fileBuffer = fs.readFileSync(filename);

//       const storageRef = ref(storage, `autotitanic/${file}/${Date.now()}`);
//       const metatype = {
//         contentType: `image/${imageType}`,
//       };

//       const uploadTask = await uploadBytesResumable(storageRef, fileBuffer, metatype);

//       const downloadUrl = await getDownloadURL(uploadTask.ref);
//       downloadUrls.push(downloadUrl);
//       const newMake = { label, type: ["cars"], logo: downloadUrl };
//       const make = new makeModel(newMake);
//       const result = await make.save();
//     }

//     return res.send({
//       status: 200,
//       data: downloadUrls,
//     });
//   } catch (error) {
//     console.log("file upload error", error);
//     return ResponseService.failed(res, `Error in uploading the files ${error}`);
//   }
// };
