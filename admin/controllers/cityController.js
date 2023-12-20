const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const cityModel = require("../../Models/cityModel");

module.exports.getAllCities = async (req, res) => {
  try {
    const { page, limit, countryId } = req.query;

    let allCities = [];
    let cursor = {};

    if (countryId) {
      cursor = await cityModel
        .find({ countryId }, null, {
          sort: { name: 1 },
        })
        .lean()
        .cursor();
    } else {
      cursor = await cityModel
        .find({}, null, {
          sort: { name: 1 },
          limit: limit,
          skip: (Number(page) - 1) * limit,
        })
        .lean()
        .cursor();
    }

    cursor.on("data", function (city) {
      allCities.push(city);
    });

    cursor.on("end", async () => {
      const totalCount = await cityModel.count();

      const response = {
        items: allCities,
        totalCount: totalCount,
      };

      return ResponseService.success(
        res,
        "Cities list found successfully",
        response
      );
    });
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.addCities = async (req, res) => {
  try {
    const { name, countryId } = req.body;

    const validationError = checkRequiredFields({
      name,
      countryId,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newCity = { name, countryId };
    const city = new cityModel(newCity);

    const isCityExist = await cityModel.findOne({
      name,
    });

    if (isCityExist) {
      return ResponseService.failed(
        res,
        "City with name already exits",
        StatusCode.forbidden
      );
    }

    const result = await city.save();

    return ResponseService.success(res, "City added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getCityDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const cityDetails = await cityModel.findOne({ _id: id });

    if (!cityDetails)
      return ResponseService.failed(res, "City not found", StatusCode.notFound);

    return ResponseService.success(
      res,
      "City details found successfully",
      cityDetails
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.updateCity = async (req, res) => {
  try {
    const { name, _id } = req.body;

    const validationError = checkRequiredFields({
      name,
      _id,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isCityExist = await cityModel.findOne({
      _id: _id,
    });

    if (!isCityExist)
      return ResponseService.failed(res, "City not found", StatusCode.notFound);

    const result = await cityModel.updateOne(
      {
        _id: _id,
      },
      {
        $set: { name },
      }
    );

    return ResponseService.success(res, "City updated successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.deleteCity = async (req, res) => {
  try {
    const { cityId } = req.params;

    const validationError = checkRequiredFields({ cityId });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isCityExist = await cityModel.findOne({
      _id: cityId,
    });

    if (!isCityExist)
      return ResponseService.failed(res, "City not found", StatusCode.notFound);

    const result = await cityModel.deleteOne({
      _id: cityId,
    });

    return ResponseService.sukccess(res, "City deleted successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};