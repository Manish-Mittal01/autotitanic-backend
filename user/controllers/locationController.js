const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const countryModel = require("../../Models/countryModel");
const cityModel = require("../../Models/cityModel");

module.exports.getAllCountries = async (req, res) => {
  try {
    let allCountries = await countryModel
      .find({}, null, {
        sort: { name: 1 },
      })
      .lean();

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
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(
      res,
      "Something wrong happend",
      StatusCode.srevrError
    );
  }
};

module.exports.getAllCities = async (req, res) => {
  try {
    const { countryId } = req.params;

    const validationError = checkRequiredFields({ countryId });
    if (validationError)
      return ResponseService.failed(
        res,
        validationError,
        StatusCode.badRequest
      );

    const allCities = await cityModel
      .find({ country: countryId }, null, {
        sort: { name: 1 },
      })
      .lean();

    const totalCount = await cityModel.countDocuments({ country: countryId });

    const response = {
      items: allCities,
      totalCount: totalCount,
    };

    return ResponseService.success(
      res,
      "Cities list found successfully",
      response
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
