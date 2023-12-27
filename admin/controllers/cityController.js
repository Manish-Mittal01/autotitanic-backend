const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const cityModel = require("../../Models/cityModel");

module.exports.getCitiesList = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.body;

    let queryObj = {};
    if (search) {
      queryObj.name = { $regex: search, $options: "i" };
    }

    const allCities = await cityModel
      .find({ ...queryObj }, null, {
        limit: limit,
        skip: (Number(page) - 1) * limit,
      })
      .lean()
      .populate("country");

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
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};

module.exports.addCities = async (req, res) => {
  try {
    const { name, country } = req.body;

    const validationError = checkRequiredFields({
      name,
      country,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newCity = { name, country };
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

    return ResponseService.success(res, "City deleted successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
