const { StatusCode } = require("../../common/Constants");
const { ResponseService } = require("../../common/responseService");
const allModels = require("../../Models/allModels");

module.exports.getAllModels = async (req, res) => {
  try {
    const { makeId } = req.params;
    if (!makeId)
      return ResponseService.failed(
        res,
        "makeId is requierd",
        StatusCode.notFound
      );

    const allModel = await allModels.find({ brandId: makeId }, null, {
      sort: { label: 1 },
    });

    return ResponseService.success(
      res,
      "Make list found successfully",
      allModel
    );
  } catch (error) {
    console.log("error", error);
    return ResponseService.failed(res, "Something wrong happend");
  }
};