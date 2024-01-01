const { Types } = require("mongoose");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const vehiclesModel = require("../../Models/vehiclesModel");

module.exports.addVehicle = async (req, res) => {
  try {
    const {
      condition,
      country,
      city,
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
      city,
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
    const result = await vehicle.save();

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
    let { filters = {}, paginationDetails, sort } = req.body;
    paginationDetails = paginationDetails || { page: 1, limit: 25 };

    console.log("filters", filters);

    const extraFilters = [
      "minPrice",
      "maxPrice",
      "minYear",
      "maxYear",
      "minMileage",
      "maxMileage",
    ];

    const idFilters = ["make", "model", "variant", "city", "country"];

    const filterById = (filter) => {
      const myFilter = filter ? { _id: Types.ObjectId(filter) } : {};
      return myFilter;
    };

    const queryObj = {};
    Object.keys(filters).forEach((filter) => {
      const searchValue = filters[filter];
      if (
        searchValue &&
        !extraFilters.includes(filter) &&
        !idFilters.includes(filter)
      ) {
        queryObj[filter] = { $regex: searchValue, $options: "i" };
      }
    });

    queryObj.price = {
      $gte: parseInt(filters.minPrice) || 0,
      $lte: parseInt(filters.maxPrice || 2147483647),
    };
    queryObj.year = {
      $gte: parseInt(filters.minYear || 2000),
      $lte: parseInt(filters.maxYear || new Date().getFullYear()),
    };
    queryObj.mileage = {
      $gte: parseInt(filters.minMileage || 0),
      $lte: parseInt(filters.maxMileage || 100),
    };
    console.log("queryObj", queryObj);

    let allVehicles = [];
    if (sort) {
      allVehicles = await vehiclesModel.find({ ...queryObj }, null, {
        skip: (paginationDetails.page - 1) * paginationDetails.limit,
        limit: paginationDetails.limit,
        sort: sort,
      });
    } else {
      allVehicles = await vehiclesModel.aggregate([
        {
          $lookup: {
            from: "countries",
            localField: "country",
            foreignField: "_id",
            pipeline: [
              {
                $match: filterById(filters.country),
              },
            ],
            as: "country",
          },
        },
        { $unwind: "$country" },
        {
          $lookup: {
            from: "cities",
            localField: "city",
            foreignField: "_id",
            pipeline: [
              {
                $match: filterById(filters.city),
              },
            ],
            as: "city",
          },
        },
        { $unwind: "$city" },
        {
          $lookup: {
            from: "makes",
            localField: "make",
            foreignField: "_id",
            pipeline: [
              {
                $match: filterById(filters.make),
              },
            ],
            as: "make",
          },
        },
        { $unwind: "$make" },
        {
          $lookup: {
            from: "models",
            localField: "model",
            foreignField: "_id",
            pipeline: [
              {
                $match: filterById(filters.model),
              },
            ],
            as: "model",
          },
        },
        { $unwind: "$model" },
        {
          $lookup: {
            from: "variants",
            localField: "variant",
            foreignField: "_id",
            pipeline: [
              {
                $match: filterById(filters.variant),
              },
            ],
            as: "variant",
          },
        },
        // { $unwind: "$variant" },

        {
          $skip: (Number(paginationDetails.page) - 1) * paginationDetails.limit,
        },
        {
          $limit: paginationDetails.limit,
        },
        {
          $match: {
            ...queryObj,
          },
        },
      ]);
    }

    const countFilters = {};
    idFilters.forEach((filter) => {
      if (filters[filter]) {
        countFilters[filter] = filters[filter];
      }
    });

    const totalCount = await vehiclesModel.countDocuments({
      ...queryObj,
      ...countFilters,
    });

    console.log("allVehicles", allVehicles);

    const response = {
      items: allVehicles,
      totalCount: totalCount,
    };

    return ResponseService.success(
      res,
      "Vehicles list found successfully",
      response
    );
  } catch (error) {
    console.log("error in vehicle list", error);
    return ResponseService.failed(res, "Something wrong happened");
  }
};

module.exports.getResultCount = async (req, res) => {
  try {
    let {
      filters,
      filters: { minPrice = 0, maxPrice },
    } = req.body;

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
      price: {
        $gte: parseInt(minPrice || 0),
        $lte: parseInt(maxPrice || 2147483647),
      },
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
