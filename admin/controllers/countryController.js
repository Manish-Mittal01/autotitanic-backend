const { ResponseService } = require("../../common/responseService");
const makeModel = require("../../Models/makeModel");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const allModels = require("../../Models/allModels");
const countryModel = require("../../Models/countryModel");

module.exports.getAllCountries = async (req, res) => {
  try {
    const { page, limit } = req.query;

    let allCountries = [];
    let cursor = {};

    if (!page) {
      cursor = await countryModel
        .find({}, null, {
          sort: { name: 1 },
        })
        .lean()
        .cursor();
    } else {
      cursor = await countryModel.find({}).lean().cursor();
    }

    cursor.on("data", function (country) {
      allCountries.push(country);
    });

    cursor.on("end", async () => {
      for (let country of allCountries) {
        const models = await allModels.find({ makeId: country._id });
        country.models = models;
      }

      const totalCount = await countryModel.count();

      const response = {
        items: allCountries,
        totalCount: totalCount,
      };

      return ResponseService.success(
        res,
        "Countries list found successfully",
        response
      );
    });
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.addCountry = async (req, res) => {
  try {
    const { name, flag, countryCode, currency, cities } = req.body;

    const validationError = checkRequiredFields({
      name,
      flag,
      countryCode,
      currency,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newCountry = { name, flag, countryCode, currency, cities };
    const country = new countryModel(newCountry);

    const isCountryExist = await countryModel.findOne({
      name: name,
    });

    if (isCountryExist) {
      return ResponseService.failed(
        res,
        "Country with name already exits",
        StatusCode.forbidden
      );
    }

    const result = await country.save();

    return ResponseService.success(res, "Country added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getMakeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const makeDetails = await makeModel.findOne({ _id: id });

    if (!makeDetails)
      return ResponseService.failed(
        res,
        "Invalid make id",
        StatusCode.notFound
      );

    return ResponseService.success(
      res,
      "Make list found successfully",
      makeDetails
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.updateMake = async (req, res) => {
  try {
    const { label, type, logo, makeId } = req.body;

    const validationError = checkRequiredFields({
      label,
      type,
      logo,
      makeId,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isMakeExist = await makeModel.findOne({
      _id: makeId,
    });

    if (!isMakeExist)
      return ResponseService.failed(res, "Make not found", StatusCode.notFound);
    const result = await makeModel.updateOne(
      {
        _id: makeId,
      },
      {
        $set: {
          label: label,
          type: type,
          logo: logo,
        },
      }
    );

    return ResponseService.success(res, "Make updated successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.deleteMake = async (req, res) => {
  try {
    const { makeId } = req.body;

    const validationError = checkRequiredFields({ makeId });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isMakeExist = await makeModel.findOne({
      _id: makeId,
    });

    if (!isMakeExist)
      return ResponseService.failed(res, "Make not found", StatusCode.notFound);
    const result = await makeModel.deleteOne({
      _id: makeId,
    });

    return ResponseService.success(res, "Make added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
