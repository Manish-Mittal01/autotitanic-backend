const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const { transporter } = require("../../firebaseConfig");
const { Types, default: mongoose } = require("mongoose");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const vehiclesModel = require("../../Models/vehiclesModel");
const { UserServices } = require("../../services/userServices");
const UserModel = require("../../Models/UserModel");
const cityModel = require("../../Models/cityModel");
const reviewModel = require("../../Models/reviewModel");

module.exports.addVehicle = async (req, res) => {
  try {
    const { condition, country, city, title, description, media, price, currency, type } = req.body;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // console.log("isTokenValid", isTokenValid);
    if (isTokenValid?.tokenExpired || !isTokenValid._id)
      return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

    const validationError = checkRequiredFields({
      type,
    });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    if (media.length < 2)
      return ResponseService.failed(res, "Atleast 2 images required", StatusCode.badRequest);

    let myCity = "";

    if (Types.ObjectId.isValid(city)) {
      myCity = city;
    } else {
      const isCityExist = await cityModel.findOne({
        name: city,
      });

      if (isCityExist) {
        myCity = isCityExist._id;
      } else {
        const newCity = { name: city, country, isUserCreated: true };
        const validCity = new cityModel(newCity);
        const result = await validCity.save();
        myCity = result._id;
      }
    }

    const newVehicle = {
      ...req.body,
      user: isTokenValid._id,
      city: myCity,
    };
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
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);
    // if (isTokenValid?.tokenExpired || !isTokenValid._id)

    let { filters = {}, paginationDetails, listType } = req.body;
    paginationDetails = paginationDetails || { page: 1, limit: 25 };

    const extraFilters = ["minPrice", "maxPrice", "minYear", "maxYear", "minMileage", "maxMileage"];
    const idFilters = ["make", "model", "city", "country", "user"];
    let queryObj = {};

    const keys = Object.keys(vehiclesModel.schema.paths); // Get all keys from the schema
    const orConditions = keys
      .map((key) => {
        const condition = {};

        const field = vehiclesModel.schema.paths[key];
        const regex = new RegExp(filters.keyword, "i"); // 'i' flag for case-insensitive search

        // Check if the field type
        if (field.instance === "ObjectID" || field.instance instanceof mongoose.Types.ObjectId) {
          // condition[`${key}._id`] = Types.ObjectId(filters[key]);
        } else if (field.instance === "String") {
          condition[key] = { $regex: regex };
        } else if (field.instance === "Number") {
          condition[key] = filters.keyword;
        } else if (field.instance === "Array" && field.caster.instance === "String") {
          condition[key] = { $in: [regex] };
        }

        return condition;
      })
      .filter((condition) => Object.keys(condition).length > 0);

    queryObj = { $or: orConditions };

    Object.keys(filters).forEach((filter) => {
      const searchValue = filters[filter];
      if (
        searchValue.toString() &&
        !extraFilters.includes(filter) &&
        !idFilters.includes(filter) &&
        filter !== "userType" &&
        filter !== "keyword"
      ) {
        queryObj[filter] =
          typeof searchValue === "string" ? { $regex: searchValue, $options: "i" } : searchValue;
      }
    });

    if (filters.sellOrRent) {
      queryObj.sellOrRent = { $regex: filters.sellOrRent, $options: "i" };
    }

    idFilters.forEach((filter) => {
      if (filters[filter]) {
        queryObj[`${filter}._id`] = Types.ObjectId(filters[filter]);
      }
    });
    // listType
    if (listType === "admin" && !filters.status) {
      queryObj.status = { $ne: "draft" };
    }
    // userType
    if (filters.userType) {
      queryObj[`user.userType`] = { $regex: filters.userType, $options: "i" };
    }

    if (filters.minPrice || filters.maxPrice) {
      queryObj.price = {
        $gte: parseInt(filters.minPrice) || 0,
        $lte: parseInt(filters.maxPrice || 9999999999),
      };
    }
    if (filters.minYear || filters.maxYear) {
      queryObj.year = {
        $gte: parseInt(filters.minYear || 1930),
        $lte: parseInt(filters.maxYear || new Date().getFullYear()),
      };
    }
    if (filters.minMileage || filters.maxMileage) {
      queryObj.mileage = {
        $gte: parseInt(filters.minMileage || 0),
        $lte: parseInt(filters.maxMileage || 999999),
      };
    }

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
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "reviews",
          let: {
            userId: "$user._id",
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$seller", "$$userId"] },
              },
            },
          ],
          as: "sellerReviews",
        },
      },

      {
        $lookup: {
          from: "wishlists",
          let: {
            vehicleId: "$_id",
            userId: Types.ObjectId(isTokenValid._id),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$user", "$$userId"],
                    },
                    { $eq: ["$vehicle", "$$vehicleId"] },
                  ],
                },
              },
            },
          ],
          as: "wishlistItem",
        },
      },
      {
        $unwind: {
          path: "$wishlistItem",
          includeArrayIndex: "0",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $lookup: {
          from: "compares",
          let: {
            vehicleId: "$_id",
            userId: Types.ObjectId(isTokenValid._id),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$user", "$$userId"],
                    },
                    { $eq: ["$vehicle", "$$vehicleId"] },
                  ],
                },
              },
            },
          ],
          as: "compareItem",
        },
      },
      {
        $unwind: {
          path: "$compareItem",
          includeArrayIndex: "0",
          preserveNullAndEmptyArrays: true,
        },
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
      {
        $skip: (Number(paginationDetails.page) - 1) * paginationDetails.limit,
      },
      {
        $limit: paginationDetails.limit,
      },
    ]);

    const vehicleCount = await getVehicleCount(filters);
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
    const response = {
      totalCount: vehicleCount,
    };

    return ResponseService.success(res, "Count successful", response);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happened");
  }
};

module.exports.getResultCountByFilter = async (req, res) => {
  try {
    let { filters } = req.body;

    const result = {};
    const filterKeys = Object.keys(filters);

    // for (let i in filterKeys) {
    //   let filterKey = filterKeys[i];

    //   for (let filterValue of filters[filterKey]) {
    //     const vehicleCount = await getVehicleCount({ [filterKey]: filterValue });

    //     result[filterKey] = [
    //       ...(result[filterKey] || []),
    //       { value: filterValue, count: vehicleCount },
    //     ];
    //   }
    // }

    for (let filterValue of filters.bodyStyle) {
      const vehicleCount = await getVehicleCount({
        bodyStyle: filterValue,
        type: filters.type || "cars",
      });

      result.bodyStyle = [...(result.bodyStyle || []), { value: filterValue, count: vehicleCount }];
    }

    return ResponseService.success(res, "Count successful", result);
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happened");
  }
};

const getVehicleCount = async (filters) => {
  const queryObj = myFilter(filters);

  // console.log("filters", filters);
  // console.log("queryObj1", queryObj);

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
    // {
    //   $lookup: {
    //     from: "variants",
    //     localField: "variant",
    //     foreignField: "_id",
    //     as: "variant",
    //   },
    // },
    // { $unwind: { path: "$variant", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
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
    const { vehicleId } = req.params;
    const token = req.headers["x-access-token"];

    const isTokenValid = await UserServices.validateToken(token);

    const isValidId = Types.ObjectId.isValid(vehicleId);
    if (!isValidId) return ResponseService.failed(res, "Invalid vehicle Id", StatusCode.badRequest);

    // const details = await vehiclesModel
    //   .findOne({ _id: vehicleId })
    //   .populate([
    //     { path: "make model country city" },
    //     { path: "user", populate: { path: "country" } },
    //   ])
    //   .lean();

    const myPipeline = [
      {
        $match: {
          _id: Types.ObjectId(vehicleId),
        },
      },
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
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", includeArrayIndex: "0", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "reviews",
          let: {
            userId: "$user._id",
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$seller", "$$userId"] },
              },
            },
          ],
          as: "sellerReviews",
        },
      },
    ];

    if (isTokenValid._id) {
      myPipeline.push(
        ...[
          {
            $lookup: {
              from: "wishlists",
              let: {
                vehicleId: "$_id",
                userId: Types.ObjectId(isTokenValid._id),
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$user", "$$userId"],
                        },
                        { $eq: ["$vehicle", "$$vehicleId"] },
                      ],
                    },
                  },
                },
              ],
              as: "wishlistItem",
            },
          },
          {
            $unwind: {
              path: "$wishlistItem",
              includeArrayIndex: "0",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $lookup: {
              from: "compares",
              let: {
                vehicleId: "$_id",
                userId: Types.ObjectId(isTokenValid._id),
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ["$user", "$$userId"],
                        },
                        { $eq: ["$vehicle", "$$vehicleId"] },
                      ],
                    },
                  },
                },
              ],
              as: "compareItem",
            },
          },
          {
            $unwind: {
              path: "$compareItem",
              includeArrayIndex: "0",
              preserveNullAndEmptyArrays: true,
            },
          },
        ]
      );
    }

    myPipeline.push({
      $limit: 1,
    });

    let details = await vehiclesModel.aggregate(myPipeline);
    details = details[0];

    if (!details) return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);
    const ratings = await reviewModel.find({ seller: details.user?._id }).lean();
    let ratingAvg =
      ratings.reduce((acc, curr) => acc + Number(curr.rating), 0) / ratings.length || 0;
    ratingAvg = ratingAvg.toFixed(1);

    return ResponseService.success(res, "Vehicle details found", {
      ...details,
      rating: ratingAvg,
      reviewsCount: ratings.length,
    });
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return ResponseService.failed(res, "id is required", StatusCode.notFound);
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) return ResponseService.failed(res, "Invalid vehicle Id", StatusCode.badRequest);

    const details = await vehiclesModel.findOne({ _id: id });

    if (!details) return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);
    const result = await vehiclesModel.updateOne({ _id: id }, { ...req.body });

    return ResponseService.success(res, "Vehicle updated", result);
  } catch (error) {
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return ResponseService.failed(res, "id is required", StatusCode.notFound);
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) return ResponseService.failed(res, "Invalid vehicle Id", StatusCode.badRequest);

    const details = await vehiclesModel.findOne({ _id: id });

    if (!details) return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);
    const result = await vehiclesModel.deleteOne({ _id: id });

    return ResponseService.success(res, "Vehicle Deleted", result);
  } catch (error) {
    return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.makeOffer = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { currency, price, vehicleId, whatsapp, call, email } = req.body;

      const token = req.headers["x-access-token"];

      const isTokenValid = await UserServices.validateToken(token);
      if (isTokenValid?.tokenExpired || !isTokenValid._id)
        return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

      if (!vehicleId) return ResponseService.failed(res, "id is required", StatusCode.notFound);
      const isValidId = Types.ObjectId.isValid(vehicleId);
      if (!isValidId)
        return ResponseService.failed(res, "Invalid vehicle Id", StatusCode.badRequest);

      const details = await vehiclesModel.findOne({ _id: vehicleId }).populate("user");
      const user = await UserModel.findOne({ _id: isTokenValid._id });

      if (!user) return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);
      if (!details) return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);

      const mailOptions = {
        from: "Manish Mittal <devmanishmittal@gmail.com>", // Something like: Jane Doe <janedoe@gmail.com>
        to: details.user.email,
        subject: "Autotitanic Post Offer", // email subject
        html: `<p style="font-size: 16px;">Hello ${details.user.name}
        <br/>
      We have Great news
      <br/><br/>
      Hurray!! You got an offer on your post at <a href="manishmittal.tech">manishmittal.tech</a>. ${
        user.name
      } showed interest in your post and offers ${currency} ${price} for your ${details.type.slice(
          0,
          -1
        )}.
        <br/><br/>
      You can contact ${user.name} on:<br/>
      ${email && user.email ? "Email: " + user.email : ""}<br/>
      ${call && user.mobile ? "Call: " + user.mobile : ""}<br/>
      ${whatsapp && user.whatsapp ? "Whatsapp: " + user.whatsapp : ""}
      </p>`, // email content in HTML
      };

      // returning result
      return transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) return ResponseService.failed(res, erro.toString(), StatusCode.badRequest);
        else return ResponseService.success(res, "Offer sent successfully", {});
      });
    } catch (error) {
      console.log("error", error);
      return ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
    }
  });
});

const myFilter = (filters) => {
  const extraFilters = ["minPrice", "maxPrice", "minYear", "maxYear", "minMileage", "maxMileage"];
  const idFilters = ["make", "model", "city", "country", "user"];

  let queryObj = {};

  const keys = Object.keys(vehiclesModel.schema.paths); // Get all keys from the schema
  const orConditions = keys
    .map((key) => {
      const condition = {};

      const field = vehiclesModel.schema.paths[key];
      const regex = new RegExp(filters.keyword, "i"); // 'i' flag for case-insensitive search

      // Check if the field type
      if (field.instance === "ObjectID" || field.instance instanceof mongoose.Types.ObjectId) {
        // condition[`${key}._id`] = Types.ObjectId(filters[key]);
      } else if (field.instance === "String") {
        condition[key] = { $regex: regex };
      } else if (field.instance === "Number") {
        condition[key] = filters.keyword;
      } else if (field.instance === "Array" && field.caster.instance === "String") {
        condition[key] = { $in: [regex] };
      }

      return condition;
    })
    .filter((condition) => Object.keys(condition).length > 0);

  queryObj = { $or: orConditions };

  Object.keys(filters).forEach((filter) => {
    const searchValue = filters[filter];
    if (
      searchValue.toString() &&
      !extraFilters.includes(filter) &&
      !idFilters.includes(filter) &&
      filter !== "userType" &&
      filter !== "keyword"
    ) {
      queryObj[filter] =
        typeof searchValue === "string" ? { $regex: searchValue, $options: "i" } : searchValue;
    }
  });

  idFilters.forEach((filter) => {
    if (filters[filter]) {
      queryObj[`${filter}._id`] = Types.ObjectId(filters[filter]);
    }
  });

  if (!filters.price) {
    queryObj.price = {
      $gte: parseInt(filters.minPrice) || 0,
      $lte: parseInt(filters.maxPrice || 9999999999),
    };
  }
  if (!filters.year && (filters.minYear || filters.maxYear)) {
    queryObj.year = {
      $gte: parseInt(filters.minYear || 1930),
      $lte: parseInt(filters.maxYear || new Date().getFullYear()),
    };
  }
  if (!filters.mileage && (filters.minMileage || filters.maxMileage)) {
    queryObj.mileage = {
      $gte: parseInt(filters.minMileage || 0),
      $lte: parseInt(filters.maxMileage || 999999),
    };
  }

  if (!filters.user && !filters.status) {
    queryObj.status = { $ne: "draft" };
  }

  if (filters.userType) {
    queryObj[`user.userType`] = { $regex: filters.userType, $options: "i" };
  }

  return queryObj;
};
