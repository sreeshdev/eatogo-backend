const logger = require("../utils/logger");

class FoodController {
  constructor(db) {
    this.db = db;

    this.modelFragment = `
  fragment HotelOnCreateJob on Hotel {
      id
      hotel {
          id
          name
          locality
          cuisine
          createdAt
        }
        name
        price
        url
        createdAt
  }
 `;
  }

  createFood = (data, user) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, price, hotelId, url } = data;
        const createFood = await this.db
          .createFood({
            hotel: {
              connect: { id: hotelId },
            },
            name,
            price,
            url: {
              set: url,
            },
          })
          .$fragment(this.modelFragment);
        if (createFood) {
          resolve({
            code: 200,
            message: "hotel created",
            data: createFood,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.COMPANY.create",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "Error creating company",
          data: err,
        });
      }
    });
  };

  getOne = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const Food = await this.db
          .food({
            id,
          })
          .$fragment(this.modelFragment);
        if (Food) {
          resolve({
            code: 200,
            message: "Fetched Food",
            data: Food,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.Food.getOneFood",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error getting Food",
          data: err,
        });
      }
    });
  };
  getAll = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const Food = await this.db
          .foods({ where: { hotel: { id } } })
          .$fragment(this.modelFragment);
        console.log(Food);
        if (Food) {
          resolve({
            code: 200,
            message: "All companies Fetched",
            data: Food,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.Food.getAllFood",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error getting all Food",
          data: err,
        });
      }
    });
  };
}

module.exports = (db) => {
  return new FoodController(db);
};
