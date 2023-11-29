class Utility {
  static getRandomValue(list) {
    return list[Math.floor(Math.random() * list.length)];
  }
}

module.exports.Utility = Utility;

module.exports.checkRequiredFields = (reqParams) => {
  for (let value of Object.entries(reqParams)) {
    if (!value[1]) return `${value[0]} is required`;
  }
};
