const allModels = require("../Models/allModels");
const makeModel = require("../Models/makeModel");
const { StatusCode } = require("./Constants");
const { makeAndModels } = require("./makeAndModel");
const { ResponseService } = require("./responseService");

module.exports.uploadMakeAndModel = async (req, res) => {
  try {
    const allMake = await makeModel.find().lean();

    const makes = Object.keys(makeAndModels);
    for (let make of makes) {
      const myMake = allMake.find((oldMake) => oldMake.label === make);

      if (myMake) {
        for (let model of makeAndModels[make]) {
          const makeId = myMake?._id;
          const label = model.toString();

          const newModel = { label, make: makeId };
          const mymodel = new allModels(newModel);

          const isModelExist = await allModels.findOne({
            label: label,
            make: makeId,
          });

          if (!isModelExist) {
            const result = await mymodel.save();
          } else {
          }
        }
      }
    }

    const allModel = await allModels.find().lean().populate("make");
    const allModelCount = await allModels.countDocuments();

    // console.log("allMake", allMake);

    return ResponseService.success(res, "Updated", { items: allModel, count: allModelCount });
  } catch (error) {
    console.log("error", error);
  }
};
