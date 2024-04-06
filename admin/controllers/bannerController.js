const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");
const bannerModel = require("../../Models/bannerModel");
const queryModel = require("../../Models/queryModel");

module.exports.bannerList = async (req, res) => {
  try {
    const allBanners = await bannerModel.find().lean();

    return ResponseService.success(res, `Banners found successfully`, allBanners);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.addBanner = async (req, res) => {
  try {
    const { title, bannerImage } = req.body;

    const validationError = checkRequiredFields({ title, bannerImage });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const banner = { title, bannerImage };
    const newBanner = new bannerModel(banner);
    const result = await newBanner.save();

    return ResponseService.success(res, `Banner added successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.updateBanner = async (req, res) => {
  try {
    const { _id, bannerImage } = req.body;

    const validationError = checkRequiredFields({ _id, bannerImage });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const banner = await bannerModel.findOne({ _id: _id });
    if (!banner) {
      return ResponseService.failed(res, `Banner does not exist`, StatusCode.badRequest);
    }

    const result = await bannerModel.updateOne({ _id: _id }, { bannerImage: bannerImage });

    return ResponseService.success(res, `Banner updated successfully`, result);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};

module.exports.getBanner = async (req, res) => {
  try {
    const { title } = req.body;

    const validationError = checkRequiredFields({ title });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const banner = await bannerModel.findOne({ title });
    if (!banner) return ResponseService.failed(res, `Banner does not exist`, StatusCode.badRequest);

    return ResponseService.success(res, `Banner found successfully`, banner);
  } catch (error) {
    console.log("api error", error);
    return ResponseService.failed(res, error, 400);
  }
};
