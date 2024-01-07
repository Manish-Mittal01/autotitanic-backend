const { Types } = require("mongoose");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const vehiclesModel = require("../../Models/vehiclesModel");

module.exports.addVehicle = async (req, res) => {
  try {
    const { condition, country, city, title, description, media, price, currency, type } = req.body;

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
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newVehicle = { ...req.body };
    const vehicle = new vehiclesModel(newVehicle);
    const result = await vehicle.save();

    return ResponseService.success(res, `${req.body.type} added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getAllvehicles = async (req, res) => {
  try {
    let { filters = {}, paginationDetails } = req.body;
    paginationDetails = paginationDetails || { page: 1, limit: 25 };

    const extraFilters = ["minPrice", "maxPrice", "minYear", "maxYear", "minMileage", "maxMileage"];
    const idFilters = ["make", "model", "variant", "city", "country"];

    const queryObj = {};
    Object.keys(filters).forEach((filter) => {
      const searchValue = filters[filter];
      if (searchValue && !extraFilters.includes(filter) && !idFilters.includes(filter)) {
        queryObj[filter] =
          typeof searchValue === "string" ? { $regex: searchValue, $options: "i" } : searchValue;
      }
    });

    idFilters.forEach((filter) => {
      if (filters[filter]) {
        queryObj[`${filter}._id`] = Types.ObjectId(filters[filter]);
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
    // console.log("queryObj", queryObj);

    let allVehicles = [];

    allVehicles = await vehiclesModel.aggregate([
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "country",
        },
      },
      { $unwind: { path: "$country", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "city",
        },
      },
      { $unwind: { path: "$city", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "makes",
          localField: "make",
          foreignField: "_id",
          as: "make",
        },
      },
      { $unwind: { path: "$make", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "models",
          localField: "model",
          foreignField: "_id",
          as: "model",
        },
      },
      { $unwind: { path: "$model", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "variants",
          localField: "variant",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: { path: "$variant", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
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
      {
        $sort: paginationDetails.sortBy
          ? { [paginationDetails.sortBy]: paginationDetails.order }
          : { _id: 1 },
      },
    ]);

    // console.log("allVehicles", allVehicles);

    const countFilters = { ...queryObj };
    idFilters.forEach((filter) => {
      if (filters[filter]) {
        delete countFilters[`${filter}._id`];

        countFilters[filter] = filters[filter];
      }
    });

    const totalCount = await vehiclesModel.countDocuments({ ...countFilters });

    const response = {
      items: allVehicles,
      totalCount: totalCount,
    };

    return ResponseService.success(res, "Vehicles list found successfully", response);
  } catch (error) {
    console.log("error in vehicle list", error);
    return ResponseService.failed(res, "Something wrong happened");
  }
};

module.exports.getResultCount = async (req, res) => {
  try {
    let { filters } = req.body;

    // const newFilters = {};
    // ["country", "make", "model"].forEach((filter) => {
    //   if (filters?.[filter]) {
    //     newFilters[filter] = filters[filter];
    //   }
    // });
    // if (filters?.minPrice) {
    //   newFilters.price = {
    //     ...newFilters.price,
    //     $gte: parseInt(filters.minPrice),
    //   };
    // }
    // if (filters?.maxPrice) {
    //   newFilters.price = {
    //     ...newFilters.price,
    //     $lte: parseInt(filters.maxPrice),
    //   };
    // }

    // console.log("newFilters", newFilters);

    // let vehiclesCount = await vehiclesModel.countDocuments({
    //   ...newFilters,
    // });

    const extraFilters = ["minPrice", "maxPrice", "minYear", "maxYear", "minMileage", "maxMileage"];
    const idFilters = ["make", "model", "variant", "city", "country"];

    const queryObj = {};
    Object.keys(filters).forEach((filter) => {
      const searchValue = filters[filter];
      if (searchValue && !extraFilters.includes(filter) && !idFilters.includes(filter)) {
        queryObj[filter] =
          typeof searchValue === "string" ? { $regex: searchValue, $options: "i" } : searchValue;
      }
    });

    idFilters.forEach((filter) => {
      if (filters[filter]) {
        queryObj[`${filter}._id`] = Types.ObjectId(filters[filter]);
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
    // console.log("queryObj", queryObj);

    const allVehiclesCount = await vehiclesModel.aggregate([
      {
        $lookup: {
          from: "countries",
          localField: "country",
          foreignField: "_id",
          as: "country",
        },
      },
      { $unwind: { path: "$country", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "cities",
          localField: "city",
          foreignField: "_id",
          as: "city",
        },
      },
      { $unwind: { path: "$city", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "makes",
          localField: "make",
          foreignField: "_id",
          as: "make",
        },
      },
      { $unwind: { path: "$make", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "models",
          localField: "model",
          foreignField: "_id",
          as: "model",
        },
      },
      { $unwind: { path: "$model", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "variants",
          localField: "variant",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: { path: "$variant", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          ...queryObj,
        },
      },
      {
        $group: { _id: null, count: { $sum: 1 } },
      },
    ]);

    const response = {
      // totalCount: vehiclesCount,
      totalCount: allVehiclesCount[0]?.count || 0,
    };

    return ResponseService.success(res, "Count successful", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happened");
  }
};
