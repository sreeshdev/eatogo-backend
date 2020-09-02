const logger = require("../utils/logger");

class CartController {
  constructor(db) {
    this.db = db;

    this.modelFragment = `
  fragment OrderOnCreateJob on Order {
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
        total
        payment
    }
 `;
  }

  CreateOrder = (data, user) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(data);
        const { userId, food, total, tokenId } = data;
        console.log("@@@", food[0].food);
        const CreateOrder = await this.db
          .createOrder({
            user: {
              connect: { id: userId },
            },
            food:
              food && food.length > 0
                ? {
                    connect: food.map((f) => ({
                      id: f.food.id,
                    })),
                  }
                : undefined,
            total,
            payment: tokenId,
          })
          .$fragment(this.modelFragment);
        if (CreateOrder) {
          for (let i = 0; i < food.length; i++) {
            const deleteCart = await this.db.deleteCart({ id: food[i].id });
          }
          resolve({
            code: 200,
            message: "order created",
            data: CreateOrder,
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
        const Order = await this.db
          .orders({ where: { user: { id } } })
          .$fragment(this.modelFragment);
        console.log(Order);
        if (Order) {
          resolve({
            code: 200,
            message: "All Orders Fetched",
            data: Order,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.Order.getAllOrder",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error getting all Order",
          data: err,
        });
      }
    });
  };
}

module.exports = (db) => {
  return new CartController(db);
};
