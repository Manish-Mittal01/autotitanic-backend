module.exports.Status = {
  success: true,
  error: false,
};

module.exports.passwordMode = {
  newUser: "new user",
  resetPassword: "reset password",
};

module.exports.ReferralBonus = {
  level1: 0.1,
};

module.exports.constantReferralBonus = 500;

module.exports.dailyBonus = 500;

module.exports.StatusCode = {
  success: 200,
  created: 201,
  accepted: 202,
  badRequest: 400,
  unauthorized: 401,
  paymentRequired: 402,
  forbidden: 403,
  notFound: 404,
  timeout: 408,
  srevrError: 500,
};

module.exports.TransactionType = {
  deposit: "deposit",
  withdraw: "withdraw",
};

module.exports.TransactionStatus = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};
