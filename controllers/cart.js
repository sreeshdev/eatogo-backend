const logger = require("../utils/logger");

class CartController {
  constructor(db) {
    this.db = db;

    this.modelFragment = `
  fragment CartOnCreateJob on Cart {
      id
      user{
          id
          email
      }
      food{
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
        quantity
    }
 `;
  }

  AddToCart = (data, user) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(data);
        const { userId, food, quantity } = data;
        const AddToCart = await this.db
          .createCart({
            user: {
              connect: { id: userId },
            },
            food: {
              connect: { id: food },
            },
            quantity,
          })
          .$fragment(this.modelFragment);
        if (AddToCart) {
          resolve({
            code: 200,
            message: "hotel created",
            data: AddToCart,
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
          .cart({
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
  deleteOne = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const Item = await this.db
          .deleteCart({
            id,
          })
          .$fragment(this.modelFragment);
        if (Item) {
          resolve({
            code: 200,
            message: "Deleted cart Item",
            data: Item,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.Item.getOneItem",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error getting Item",
          data: err,
        });
      }
    });
  };
  getAll = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const Food = await this.db
          .carts({ where: { user: { id } } })
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
  return new CartController(db);
};
