const router = require("express").Router();
const Joi = require("@hapi/joi");
const jwt = require("../services/jwt.service");

class UserRoutes {
  constructor(controller) {
    this.controller = controller;

    this.init();
  }

  init() {
    router.post("/login", async (req, res) => {
      try {
        console.log(req.body);
        const schema = {
          email: Joi.string().required(),
          password: Joi.string().required(),
        };

        const email = req.body.email;
        const password = req.body.password;

        const isValid = Joi.validate(
          {
            email: email,
            password: password,
          },
          schema
        );

        if (isValid.error !== null) {
          throw isValid.error;
        }

        const response = await this.controller.login(
          req.body.email,
          req.body.password
        );

        res.json({ code: 200, response });
      } catch (err) {
        if (err.name === "ValidationError") {
          res.json({ code: 422, msg: err.details[0].message });
        } else {
          res.json({ code: 500, msg: "An error occurred !" });
        }
      }

      res.end();
    });

    router.post("/register", async (req, res) => {
      try {
        const schema = {
          email: Joi.string().required(),
          password: Joi.string().required(),
        };

        const email = req.body.email;
        const password = req.body.password;

        const isValid = Joi.validate(
          {
            email: email,
            password: password,
          },
          schema
        );

        if (isValid.error !== null) {
          res.json(isValid.error);
          throw isValid.error;
        }

        const { body } = req;
        console.log(body);
        const regUserDetails = await this.controller.createUser({
          body,
        });
        res.json(regUserDetails);
      } catch (err) {
        res.json({ code: 500, msg: "An error occured" });
      }
    });

    router.get("/all", async (req, res) => {
      try {
        const user = await jwt.decode(req.headers["x-access-token"]).payload.id;
        const response = await this.controller.getUsers();
        res.json({ code: 200, response });
      } catch (error) {
        res.json({ code: 500, msg: "An error occurred" });
      }
    });
  }

  getRouter() {
    return router;
  }
}

module.exports = (controller) => {
  return new UserRoutes(controller);
};
