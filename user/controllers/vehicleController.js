const { Types } = require("mongoose");
const path = require("path");
const ejs = require("ejs");
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const { transporter } = require("../../firebaseConfig");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");
const vehiclesModel = require("../../Models/vehiclesModel");
const { UserServices } = require("../../services/userServices");
const UserModel = require("../../Models/UserModel");
const cityModel = require("../../Models/cityModel");
const reviewModel = require("../../Models/reviewModel");
const offerModel = require("../../Models/offerModel");

module.exports.addVehicle = async (req, res) => {
  try {
    const { country, city, title, description, media, price, currency, type, userDetails, status } =
      req.body;

    const requiredField = { type, country, city, userDetails };
    const nonDraftRequiredField = { price, title, description, currency };

    const validationError = checkRequiredFields(
      status !== "draft"
        ? {
            ...requiredField,
            ...nonDraftRequiredField,
          }
        : requiredField
    );
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
      user: userDetails._id,
      city: myCity,
    };
    const vehicle = new vehiclesModel(newVehicle);
    const result = await vehicle.save();

    return ResponseService.success(res, `${req.body.type} added successfully`, result);
  } catch (error) {
    console.log("add vehicle error", error);
    return ResponseService.serverError(res, error);
  }
};

module.exports.getAllvehicles = async (req, res) => {
  try {
    const token = req.headers["x-access-token"];
    let { filters = {}, paginationDetails, listType, extraFilters } = req.body;
    paginationDetails = paginationDetails || { page: 1, limit: 25 };

    const isTokenValid = await UserServices.validateToken(token);
    // if (isTokenValid?.tokenExpired || !isTokenValid._id)

    const queryObj = myFilter(filters);
    if (listType === "admin" && extraFilters?.user) {
      queryObj["user.email"] = extraFilters?.user || "";
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
        $limit: Number(paginationDetails.limit),
      },
    ]);

    const vehicleCount = await getVehicleCount(filters, listType, extraFilters);

    const response = {
      items: allVehicles,
      totalCount: vehicleCount,
    };

    return ResponseService.success(res, "Vehicles list found successfully", response);
  } catch (error) {
    console.log("error in vehicle list", error);
    return ResponseService.serverError(res, error);
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
    console.log("error in result count", error);
    return ResponseService.serverError(res, error);
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
    console.log("error in filter count", error);
    return ResponseService.serverError(res, error);
  }
};

const getVehicleCount = async (filters, listType, extraFilters) => {
  const queryObj = myFilter(filters);
  if (listType === "admin" && extraFilters?.user) {
    queryObj["user.email"] = extraFilters?.user || "";
  }

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
          from: "countries",
          localField: "user.country",
          foreignField: "_id",
          as: "user.country",
        },
      },
      {
        $unwind: {
          path: "$user.country",
          includeArrayIndex: "0",
          preserveNullAndEmptyArrays: true,
        },
      },
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
    return ResponseService.serverError(res, error);
  }
};

module.exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { country, city, title, description, media, price, currency, type, status, reason } =
      req.body;

    if (status === "pending") {
      const requiredField = { type, country, city };
      const nonDraftRequiredField = { price, title, description, currency, status, media };
      const validationError = checkRequiredFields(
        status !== "draft"
          ? {
              ...requiredField,
              ...nonDraftRequiredField,
            }
          : requiredField
      );
      if (validationError)
        return ResponseService.failed(res, validationError, StatusCode.badRequest);
      if (media.length < 2)
        return ResponseService.failed(res, "Atleast 2 images required", StatusCode.badRequest);
    }
    if (!id) return ResponseService.failed(res, "id is required", StatusCode.badRequest);
    const isValidId = Types.ObjectId.isValid(id);
    if (!isValidId) return ResponseService.failed(res, "Invalid vehicle Id", StatusCode.badRequest);

    const details = await vehiclesModel.findOne({ _id: id }).populate("user").lean();
    if (!details) return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);

    const result = await vehiclesModel.updateOne(
      { _id: id },
      { ...req.body, createdAt: status === "pending" ? new Date() : details.createdAt }
    );

    if (status === "approved" || status === "rejected") {
      const message =
        status === "approved"
          ? await ejs.renderFile(path.join(__dirname, "..", "..", "templates", "postApprove.ejs"), {
              name: details.user?.name?.split(" ")[0],
            })
          : status === "rejected"
          ? await ejs.renderFile(path.join(__dirname, "..", "..", "templates", "postReject.ejs"), {
              name: details.user?.name?.split(" ")[0],
              reason: reason || "",
            })
          : "";

      var mailOptions = {
        from: process.env.MAIL_SENDER,
        to: details.user.email,
        subject: "Autotitanic post",
        html: message,
      };

      const info = await transporter.sendMail(mailOptions);
    }

    return ResponseService.success(res, "Vehicle updated", result);
  } catch (error) {
    return ResponseService.serverError(res, error);
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
    return ResponseService.serverError(res, error);
  }
};

module.exports.makeOffer = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { currency, price, vehicleId, whatsapp, call, email, comment } = req.body;
      const token = req.headers["x-access-token"];

      const isTokenValid = await UserServices.validateToken(token);
      if (isTokenValid?.tokenExpired || !isTokenValid._id)
        return ResponseService.failed(res, "Unauthorized", StatusCode.unauthorized);

      if (!whatsapp && !call && !email)
        return ResponseService.failed(
          res,
          "Atleast one contact option is required",
          StatusCode.badRequest
        );

      const validationError = checkRequiredFields({ currency, price, vehicleId });
      if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

      const details = await vehiclesModel.findOne({ _id: vehicleId }).populate("user").lean();
      if (!details) return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);

      const user = await UserModel.findOne({ _id: isTokenValid._id });
      if (!user) return ResponseService.failed(res, "User not found", StatusCode.notFound);

      const newOffer = new offerModel({
        user: isTokenValid._id,
        vehicle: vehicleId,
        offer: `${currency} ${price}`,
        comment: comment,
      });
      const result = await newOffer.save();

      // const templateData = { req: req.body, vehicle: details, user: user };
      // const template = await ejs.renderFile(
      //   path.join(__dirname, "..", "..", "templates", "offerTemplate.ejs"),
      //   templateData,
      //   { async: true }
      // );

      const mailOptions = {
        from: "Autotitanic <autotitanic.com>", // Something like: Jane Doe <janedoe@gmail.com>
        to: details.user.email,
        subject: "Autotitanic Post Offer", // email subject
        // html: template,
        html: `<p style="font-size: 16px;">
          Dear ${details.user.name}
          <br/><br/>
        We have Great news for you.
        <br/><br/>
        You have received an offer for your post at <a href="www.autotitanic.com">www.autotitanic.com</a>. ${
          user.name
        } has showed interest in your ${details.type.slice(
          0,
          -1
        )} and has offered ${currency} ${price}.
          <br/><br/>
          Please reply to ${user.name} on:<br/>
        ${email && user.email ? "Email: " + user.email : ""}<br/>
        ${call && user.mobile ? "Call: " + user.mobile : ""}<br/>
        ${whatsapp && user.whatsapp ? "Whatsapp: " + user.whatsapp : ""}
       
        <br/><br/>
        ${comment ? "Message:" + comment : ""}
        <br/><br/>
        Best wishes with your transaction with Nana.
        <br/><br/>
        Kind regards,
        <br/>
        AutoTitanic team
        </p>   `,
      };

      // returning result
      return transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) return ResponseService.failed(res, erro?.toString(), StatusCode.badRequest);
        else return ResponseService.success(res, "Offer sent successfully", result);
      });
    } catch (error) {
      console.log("error making offer", error);
      return ResponseService.serverError(res, error);
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
      const regex = filters.keyword ? new RegExp(filters.keyword || "", "i") : "";

      // Check if the field type
      if (field.instance === "ObjectID" || field.instance instanceof Types.ObjectId) {
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
      searchValue?.toString() &&
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

  // userType
  if (filters.userType) {
    queryObj[`user.userType`] = { $regex: filters.userType, $options: "i" };
  }

  if (!filters.price && (filters.minPrice || filters.maxPrice)) {
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

  return queryObj;
};

module.exports.getRelatedvehicles = async (req, res) => {
  try {
    let { limit = 60, _id } = req.body;

    if (!_id) return ResponseService.failed(res, "No vehicle ID provided", StatusCode.badRequest);

    const vehicle = await vehiclesModel.findOne({ _id: _id }).lean();
    if (!vehicle) return ResponseService.failed(res, "Vehicle not found", StatusCode.notFound);

    let {
      type,
      sellOrRent,
      country,
      make,
      model,
      gearBox,
      mileage,
      bodyStyle,
      category,
      subCategory,
      birth,
      condition,
      year,
      engineSize,
      fuelType,
      enginePower,
      price,
    } = vehicle;

    const queryObj = {
      type: type,
      sellOrRent: sellOrRent,
      "country._id": Types.ObjectId(country),
      "make._id": Types.ObjectId(make),
      "model._id": Types.ObjectId(model),
    };

    const matchingScorePipe = [];
    if (sellOrRent === "sell") {
      if (["cars", "vans", "motorhomes"].includes(type)) {
        matchingScorePipe.push({ $cond: { if: { $eq: ["$gearBox", gearBox] }, then: 1, else: 0 } });

        for (let i = 1; i <= 10; i++) {
          matchingScorePipe.push({
            $cond: {
              if: {
                $or: [
                  { $eq: ["$mileage", { $add: [mileage, mileage * (i / 10)] }] },
                  { $eq: ["$mileage", { $subtract: [mileage, mileage * (i / 10)] }] },
                ],
              },
              then: (10 - i) / 10,
              else: 0,
            },
          });
        }
      } else if (type === "bikes") {
        matchingScorePipe.push({
          $cond: { if: { $eq: ["$bodyStyle", bodyStyle] }, then: 1, else: 0 },
        });

        for (let i = 1; i <= 10; i++) {
          matchingScorePipe.push({
            $cond: {
              if: {
                $or: [
                  { $eq: ["$mileage", { $add: [mileage, mileage * (i / 10)] }] },
                  { $eq: ["$mileage", { $subtract: [mileage, mileage * (i / 10)] }] },
                ],
              },
              then: (10 - i) / 10,
              else: 0,
            },
          });
        }
      } else if (["trucks", "farms", "plants"].includes(type)) {
        matchingScorePipe.push({
          $cond: { if: { $eq: ["$category", category] }, then: 1, else: 0 },
        });

        for (let i = 1; i <= 10; i++) {
          matchingScorePipe.push({
            $cond: {
              if: {
                $or: [
                  { $eq: ["$mileage", { $add: [mileage, mileage * (i / 10)] }] },
                  { $eq: ["$mileage", { $subtract: [mileage, mileage * (i / 10)] }] },
                ],
              },
              then: (10 - i) / 10,
              else: 0,
            },
          });
        }
      } else if (type === "caravans") {
        matchingScorePipe.push(
          { $cond: { if: { $eq: ["$category", category] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$birth", birth] }, then: 1, else: 0 } }
        );
      } else if (type === "partAndAccessories") {
        matchingScorePipe.push(
          { $cond: { if: { $eq: ["$category", category] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$condition", condition] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$subCategory", subCategory] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$make", make] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$model", model] }, then: 1, else: 0 } }
        );
      }
    } else if (sellOrRent === "rent") {
      for (let i = 1; i <= 10; i++) {
        matchingScorePipe.push({
          $cond: {
            if: {
              $or: [
                { $eq: ["$year", { $add: [year, i] }] },
                { $eq: ["$year", { $subtract: [year, i] }] },
              ],
            },
            then: (10 - i) / 10,
            else: 0,
          },
        });
      }

      if (type === "cars") {
        matchingScorePipe.push(
          { $cond: { if: { $eq: ["$gearBox", gearBox] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$engineSize", engineSize] }, then: 1, else: 0 } }
        );
      } else if (type === "vans" || type === "motorhomes") {
        matchingScorePipe.push(
          { $cond: { if: { $eq: ["$gearBox", gearBox] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$fuelType", fuelType] }, then: 1, else: 0 } }
        );
      } else if (type === "bikes") {
        matchingScorePipe.push(
          { $cond: { if: { $eq: ["$enginePower", enginePower] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$bodyStyle", bodyStyle] }, then: 1, else: 0 } }
        );
      } else if (type === "caravans") {
        matchingScorePipe.push(
          { $cond: { if: { $eq: ["$birth", birth] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$category", category] }, then: 1, else: 0 } }
        );
      } else if (type === "farms") {
        matchingScorePipe.push({
          $cond: { if: { $eq: ["$fuelType", fuelType] }, then: 1, else: 0 },
        });
      } else if (type === "plants") {
        matchingScorePipe.push(
          { $cond: { if: { $eq: ["$category", category] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$fuelType", fuelType] }, then: 1, else: 0 } }
        );
      } else if (type === "enginePower") {
        matchingScorePipe.push(
          { $cond: { if: { $eq: ["$enginePower", enginePower] }, then: 1, else: 0 } },
          { $cond: { if: { $eq: ["$fuelType", fuelType] }, then: 1, else: 0 } }
        );
      }
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
        $match:
          type === "partAndAccessories"
            ? { ...queryObj, subCategory: subCategory }
            : { ...queryObj },
      },
      {
        $addFields: {
          matchingScore: {
            $sum: matchingScorePipe,
          },
        },
      },
      {
        $sort: { matchingScore: -1 },
      },
      {
        $limit: Number(limit),
      },
    ]);

    const vehicleCount = allVehicles.length;
    const response = {
      items: allVehicles,
      totalCount: vehicleCount,
    };

    return ResponseService.success(res, "Vehicles list found successfully", response);
  } catch (error) {
    console.log("error in related vehicle", error);
    return ResponseService.serverError(res, error);
  }
};
