const { ResponseService } = require("../../common/responseService");
const brandModel = require("../Models/brandModel");
const { checkRequiredFields } = require("../../common/utility");
const { StatusCode } = require("../../common/Constants");

module.exports.brandController = async (req, res) => {
  try {
    const { label, vehicleType, logo } = req.body;

    const validationError = checkRequiredFields({ label, vehicleType, logo });
    if (validationError)
      return ResponseService.failed(res, validationError, StatusCode.notFound);

    const newBrand = { label, vehicleType, logo };
    const brand = new brandModel(newBrand);

    const isBrandExist = await brandModel.findOne({
      label: label,
    });

    let result = {};
    if (isBrandExist) {
      result = await brandModel.updateOne(
        {
          label: label,
        },
        {
          $set: {
            vehicleType: vehicleType,
            logo: logo,
          },
        }
      );
    } else {
      result = await brand.save();
    }

    return ResponseService.success(res, "Brand added successfully", result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getAllBrands = async (req, res) => {
  try {
    const allBrands = await brandModel.find({}, null, { sort: { label: 1 } });

    return ResponseService.success(
      res,
      "brands list found successfully",
      allBrands
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};
