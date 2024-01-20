const { Types } = require("mongoose");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const vehiclesModel = require("../../Models/vehiclesModel");
const { UserServices } = require("../../services/userServices");

module.exports.addVehicle = async (req, res) => {
  try {
    const { condition, country, city, title, description, media, price, currency, type } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

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

    const newVehicle = { ...req.body, user: isTokenValid._id };
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
      $lte: parseInt(filters.maxPrice || 9999999999),
    };
    queryObj.year = {
      $gte: parseInt(filters.minYear || 2000),
      $lte: parseInt(filters.maxYear || new Date().getFullYear()),
    };
    queryObj.mileage = {
      $gte: parseInt(filters.minMileage || 0),
      $lte: parseInt(filters.maxMileage || 999999),
    };
    // console.log("queryObj", queryObj);

    let allVehicles = await vehiclesModel.aggregate([
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
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
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

    const vehicleCount = await getVehicleCount(queryObj);

    const response = {
      items: allVehicles,
      totalCount: vehicleCount,
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

    const vehicleCount = await getVehicleCount(filters);

    // const extraFilters = ["minPrice", "maxPrice", "minYear", "maxYear", "minMileage", "maxMileage"];
    // const idFilters = ["make", "model", "variant", "city", "country"];

    // const queryObj = {};
    // Object.keys(filters).forEach((filter) => {
    //   const searchValue = filters[filter];
    //   if (searchValue && !extraFilters.includes(filter) && !idFilters.includes(filter)) {
    //     queryObj[filter] =
    //       typeof searchValue === "string" ? { $regex: searchValue, $options: "i" } : searchValue;
    //   }
    // });

    // idFilters.forEach((filter) => {
    //   if (filters[filter]) {
    //     queryObj[`${filter}._id`] = Types.ObjectId(filters[filter]);
    //   }
    // });

    // queryObj.price = {
    //   $gte: parseInt(filters.minPrice) || 0,
    //   $lte: parseInt(filters.maxPrice || 2147483647),
    // };
    // queryObj.year = {
    //   $gte: parseInt(filters.minYear || 2000),
    //   $lte: parseInt(filters.maxYear || new Date().getFullYear()),
    // };
    // queryObj.mileage = {
    //   $gte: parseInt(filters.minMileage || 0),
    //   $lte: parseInt(filters.maxMileage || 100),
    // };
    // // console.log("queryObj", queryObj);

    // const allVehiclesCount = await vehiclesModel.aggregate([
    //   {
    //     $lookup: {
    //       from: "countries",
    //       localField: "country",
    //       foreignField: "_id",
    //       as: "country",
    //     },
    //   },
    //   { $unwind: { path: "$country", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
    //   {
    //     $lookup: {
    //       from: "cities",
    //       localField: "city",
    //       foreignField: "_id",
    //       as: "city",
    //     },
    //   },
    //   { $unwind: { path: "$city", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
    //   {
    //     $lookup: {
    //       from: "makes",
    //       localField: "make",
    //       foreignField: "_id",
    //       as: "make",
    //     },
    //   },
    //   { $unwind: { path: "$make", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
    //   {
    //     $lookup: {
    //       from: "models",
    //       localField: "model",
    //       foreignField: "_id",
    //       as: "model",
    //     },
    //   },
    //   { $unwind: { path: "$model", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
    //   {
    //     $lookup: {
    //       from: "variants",
    //       localField: "variant",
    //       foreignField: "_id",
    //       as: "variant",
    //     },
    //   },
    //   { $unwind: { path: "$variant", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
    //   {
    //     $match: {
    //       ...queryObj,
    //     },
    //   },
    //   {
    //     $group: { _id: null, count: { $sum: 1 } },
    //   },
    // ]);

    const response = {
      totalCount: vehicleCount,
    };

    return ResponseService.success(res, "Count successful", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happened");
  }
};

const getVehicleCount = async (filters) => {
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
    $lte: parseInt(filters.maxPrice || 9999999999),
  };
  queryObj.year = {
    $gte: parseInt(filters.minYear || 2000),
    $lte: parseInt(filters.maxYear || new Date().getFullYear()),
  };
  queryObj.mileage = {
    $gte: parseInt(filters.minMileage || 0),
    $lte: parseInt(filters.maxMileage || 999999),
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

  const totalCount = allVehiclesCount[0]?.count || 0;

  return totalCount;
};

module.exports.getVehicleDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) return ResponseService.failed(res, "Invalid vehicle Id", StatusCode.badRequest);

    const details = await vehiclesModel
      .findOne({ _id: id })
      .populate("make model variant country city");

    if (!details || details.length <= 0)
      return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);

    return ResponseService.success(res, "Vehicle details found", details);
  } catch (error) {
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};
