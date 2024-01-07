const contentPagesModel = require("../../Models/contentPagesModel");
const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const { checkRequiredFields } = require("../../common/utility");

module.exports.getContentPageList = async (req, res) => {
  try {
    const contentPages = await contentPagesModel.find({}, "_id page").lean();

    const response = contentPages || {};

    return ResponseService.success(res, "Page list found successfully", response);
  } catch (error) {
    console.log("erro", error);
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.getContentPage = async (req, res) => {
  try {
    const { pageId } = req.params;
    const contentPages = await contentPagesModel.findOne({ _id: pageId });

    const response = contentPages || {};

    return ResponseService.success(res, "Page found successfully", response);
  } catch (error) {
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.addContentPage = async (req, res) => {
  try {
    const { page, description } = req.body;

    const validationError = checkRequiredFields({ page, description });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isPageExist = await contentPagesModel.findOne({ page });

    console.log("isPageExist", isPageExist);
    if (isPageExist)
      return ResponseService.failed(res, "Page heading already exist", StatusCode.notFound);

    const newPageContent = { page, description };
    const pageContent = new contentPagesModel(newPageContent);

    const result = await pageContent.save();

    return ResponseService.success(res, "Page added successfully", result);
  } catch (error) {
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};

module.exports.updateContentPage = async (req, res) => {
  try {
    const { page, description, _id } = req.body;

    const validationError = checkRequiredFields({ page, description, _id });
    if (validationError) return ResponseService.failed(res, validationError, StatusCode.notFound);

    const isPageExist = await contentPagesModel.find({ _id });
    if (!isPageExist)
      return ResponseService.failed(res, "Page doen not exist", StatusCode.notFound);

    const result = await contentPagesModel.updateOne({ _id: _id }, { page, description });

    return ResponseService.success(res, "Page updated successfully", result);
  } catch (error) {
    ResponseService.failed(res, "Something wrong happend", StatusCode.srevrError);
  }
};
