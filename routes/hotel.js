const router = require("express").Router();
const Joi = require("@hapi/joi");
const jwt = require("../services/jwt.service");

class HotelController {
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
        const response = await this.controller.createHotel(body);
        res.json({ code: 200, response });
      } catch (err) {
        res.json({ code: 500, msg: "An error occured", err: err });
      }
    });

    router.post("/upload", async (req, res) => {
      try {
        const response = await this.controller.uploadFiles(req);
        res.json({ code: 200, response });
      } catch (err) {
        res.json({ code: 500, response });
      }
    });

    router.get("/:id", async (req, res) => {
      try {
        const {
          params: { id },
        } = req;
        const response = await this.controller.getOne(id);
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
  return new HotelController(controller);
};
