const allModels = require("../Models/allModels");
const countryModel = require("../Models/countryModel");
const makeModel = require("../Models/makeModel");
const { StatusCode } = require("./Constants");
const { ResponseService } = require("./responseService");
const { makeAndModels } = require("./jsonData");
const { countryAndCity } = require("./jsonData");
const { currencyAndCode } = require("./jsonData");
const cityModel = require("../Models/cityModel");

module.exports.uploadMakeAndModel = async (req, res) => {
  try {
    const allMake = await makeModel.find().lean();

    const makes = Object.keys(makeAndModels);
    for (let make of makes) {
      const myMake = allMake.find((oldMake) => oldMake.label === make);

      if (myMake) {
        for (let model of makeAndModels[make]) {
          const makeId = myMake?._id;
          const label = model.toString();

          const newModel = { label, make: makeId };
          const mymodel = new allModels(newModel);

          const isModelExist = await allModels.findOne({
            label: label,
            make: makeId,
          });

          if (!isModelExist) {
            const result = await mymodel.save();
          } else {
          }
        }
      }
    }

    const allModel = await allModels.find().lean().populate("make");
    const allModelCount = await allModels.countDocuments();

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
