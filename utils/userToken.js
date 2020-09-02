const jwt = require("../services/jwt.service");

userToken = token => {
  new Promise(async (resolve, reject) => {
    try {
      const decoded = await jwt.verify(token);
      return decoded.user;
    } catch (err) {
      logger.Log({
        level: logger.LEVEL.ERROR,
        component: "CONTROLLER.GETUSER.userToken",
        code: "CONTROLLER.QUERY.ERROR",
        description: err.toString(),
        category: "",
        ref: {}
      });
      reject(err);
    }
  });
};

module.exports = userToken;
