const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const vehiclesModel = require("../../Models/vehiclesModel");

module.exports.addVehicle = async (req, res) => {
  try {
    const {
      condition,
      country,
      state,
      title,
      description,
      media,
      price,
      currency,
      type,
    } = req.body;

    const validationError = checkRequiredFields({
      condition,
      country,
      state,
      title,
      description,
      media,
      price,
      currency,
      type,
    });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newVehicle = { ...req.body };
    const vehicle = new vehiclesModel(newVehicle);

    let result = {};
    result = await vehicle.save();

    return ResponseService.success(
      res,
      `${req.body.type} added successfully`,
      result
    );
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getAllvehicles = async (req, res) => {
  try {
    let { filters, paginationDetails, sort } = req.body;
    paginationDetails = paginationDetails
      ? paginationDetails
      : { page: 1, limit: 10 };

    let allVehicles = [];
    if (sort) {
      allVehicles = await vehiclesModel.find({ ...filters }, null, {
        skip: (paginationDetails.page - 1) * paginationDetails.limit,
        limit: paginationDetails.limit,
        sort: sort,
      });
    } else {
      allVehicles = await vehiclesModel.find({ ...filters }, null, {
        skip: (paginationDetails.page - 1) * paginationDetails.limit,
        limit: paginationDetails.limit,
      });
    }

    const totalCount = allVehicles.length;

    const response = {
      items: allVehicles,
      totalCount: totalCount,
    };

    return ResponseService.success(
      res,
      "vehicles list found successfully",
      response
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happened");
  }
};

module.exports.getResultCount = async (req, res) => {
  try {
    let {
      filters,
      // filters: { minPrice = 0, maxPrice },
    } = req.body;

    console.log("req body", req.body);
    console.log("req filters", req.body?.filters);

    const validationError = checkRequiredFields({ filters });
    if (validationError)
      return ResponseService.failed(
        res,
        validationError,
        StatusCode.badRequest
      );

    const newFilters = {};

    ["country", "make", "model"].forEach((filter) => {
      if (filters[filter]) {
        newFilters[filter] = filters[filter];
      }
    });

    let vehiclesCount = await vehiclesModel.countDocuments({
      ...newFilters,
      price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) },
    });

    const response = {
      totalCount: vehiclesCount,
    };

    return ResponseService.success(res, "Count successful", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happened");
  }
};
