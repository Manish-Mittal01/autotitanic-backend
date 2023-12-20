const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
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
      cursor = await countryModel
        .find({}, null, {
          sort: { name: 1 },
          limit: limit,
          skip: (Number(page) - 1) * limit,
        })
        .lean()
        .cursor();
    }

    cursor.on("data", function (country) {
      allCountries.push(country);
    });

    cursor.on("end", async () => {
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
    const { name, flag, countryCode, currency } = req.body;

    const validationError = checkRequiredFields({
      name,
      flag,
      countryCode,
      currency,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newCountry = { name, flag, countryCode, currency };
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

module.exports.getCountryDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const countryDetails = await countryModel.findOne({ _id: id });

    if (!countryDetails)
      return ResponseService.failed(
        res,
        "Country not found",
        StatusCode.notFound
      );

    return ResponseService.success(
      res,
      "Make list found successfully",
      countryDetails
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.updateCountry = async (req, res) => {
  try {
    const { name, flag, countryCode, currency, _id } = req.body;

    const validationError = checkRequiredFields({
      name,
      flag,
      countryCode,
      currency,
      _id,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isCountryExist = await countryModel.findOne({
      _id: _id,
    });

    if (!isCountryExist)
      return ResponseService.failed(
        res,
        "Country not found",
        StatusCode.notFound
      );

    const result = await countryModel.updateOne(
      {
        _id: _id,
      },
      {
        $set: { name, flag, countryCode, currency },
      }
    );

    return ResponseService.success(res, "Country updated successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.deleteCountry = async (req, res) => {
  try {
    const { countryId } = req.params;

    const validationError = checkRequiredFields({ countryId });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isCountryExist = await countryModel.findOne({
      _id: countryId,
    });

    if (!isCountryExist)
      return ResponseService.failed(
        res,
        "Country not found",
        StatusCode.notFound
      );
    const result = await countryModel.deleteOne({
      _id: countryId,
    });

    return ResponseService.success(res, "Country deleted successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
