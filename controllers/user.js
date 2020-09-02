const bcrypt = require("bcryptjs");
const logger = require("../utils/logger");
const JWT = require("../services/jwt.service");
const Moment = require("moment");
const axios = require("axios");

class UserController {
  constructor(db) {
    this.db = db;
    this.createFragment = `
        fragment UserOnCreateUser on User {
            id
            email
            password
            isAdmin
            createdAt 
        }
        `;
  }

  getAllUsers = (user) => {
    const { db } = this;
    return new Promise(async (resolve, reject) => {
      try {
        const users = await db.users().$fragment(this.createFragment);
        if (users) {
          resolve({
            code: 200,
            message: "user fetched",
            data: { users, user },
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.USER.getUser",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error fetching user",
          data: err,
        });
      }
    });
  };

  login = (email, password) => {
    const { db, createFragment } = this;
    return new Promise(async function(resolve, reject) {
      try {
        console.log(email);
        const user = await db
          .users({
            where: { email },
          })
          .$fragment(createFragment);
        console.log(user);

        if (!user[0]) {
          resolve({
            code: 403,
            message: "User does not exist!",
            data: null,
          });
        }

        const passwordMatch = await bcrypt.compare(password, user[0].password);
        if (!passwordMatch) {
          resolve({
            code: 403,
            message: "Password Does not match",
            data: null,
          });
        }

        const payload = {
          id: user[0].id,
          isAdmin: user[0].isAdmin,
        };

        const token = await JWT.sign(payload, "2d");
        console.log(user);
        resolve({
          code: 200,
          message: "USER_LOGGED_IN",
          data: {
            user: {
              ...user,
              password: undefined,
            },
            token,
          },
        });
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.USER.login",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject(err);
      }
    });
  };

  createUser = (data) => {
    // const { db } = this;
    return new Promise(async (resolve, reject) => {
      try {
        const { email, password } = data.body;
        var hash = await bcrypt.hash(password, 10);
        const createUser = await this.db
          .createUser({
            email,
            password: hash,
            isAdmin: false,
          })
          .$fragment(this.createFragment);

        if (createUser) {
          resolve({
            code: 200,
            message: "user created",
            data: { createUser },
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.USER.createUser",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error creating user",
          data: err,
        });
      }
    });
  };
}

module.exports = (db) => {
  return new UserController(db);
};
