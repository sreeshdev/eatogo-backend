const router = require("express").Router();
const Joi = require("@hapi/joi");
const jwt = require("../services/jwt.service");

class CartController {
  constructor(controller) {
    this.controller = controller;

    this.init();
  }
  init() {
    router.post("/", async (req, res) => {
      try {
        const user = (await jwt.decode(req.headers["x-access-token"])).payload
          .id;
        console.log(user);
        const { body } = req;
        console.log(body);
        const response = await this.controller.AddToCart(body);
        res.json({ code: 200, response });
      } catch (err) {
        res.json({ code: 500, msg: "An error occured", err: err });
      }
    });

    router.get("/user/:id", async (req, res) => {
      try {
        const {
          params: { id },
        } = req;
        const response = await this.controller.getAll(id);
        res.json({ code: 200, response });
      } catch (e) {
        res.json({ code: 500, message: "Server error, Please check the logs" });
      }
    });
    router.delete("/:id", async (req, res) => {
      try {
        const {
          params: { id },
        } = req;
        const response = await this.controller.deleteOne(id);
        res.json({ code: 200, response });
      } catch (e) {
        res.json({ code: 500, message: "Server error, Please check the logs" });
      }
    });

    router.get("/", async (req, res) => {
      try {
        const response = await this.controller.getAll();
        res.json({ code: 200, response });
      } catch (err) {
        res.json({ code: 500, msg: "An error occured" });
      }
    });
    //For referred by customers
  }

  getRouter() {
    return router;
  }
}
module.exports = (controller) => {
  return new CartController(controller);
};
