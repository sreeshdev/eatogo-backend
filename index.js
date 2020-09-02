global.env =
  process.env.NODE_ENV === undefined ? "development" : process.env.NODE_ENV;
const PORT = process.env.PORT || 3000;
const isDev = global.env === "development";
const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const httpServer = require("http").createServer(app);
const { prisma } = require("./generated/prisma-client");
// const scheduler = require("./services/scheduler/index");

const configurations = {
  // Note: You may need sudo to run on port 443
  production: {
    ssl: true,
    port: process.env.PORT || 4000,
    hostname: "localhost",
  },
  development: {
    ssl: false,
    port: process.env.PORT || 4000,
    hostname: "localhost",
  },
};

const config = configurations[global.env];
require("dotenv").config({
  path: global.env === "development" ? ".env.development" : ".env.production",
});

class Server {
  constructor() {
    this.drivers = [];
    this.init();
  }

  async init() {
    try {
      await this.initControllers();
      this.initExpress();
      this.initRoutes();
      this.initServer();
    } catch (err) {
      console.log(err);
      process.exit(-1);
    }
  }

  initControllers() {
    this.userController = require("./controllers/user")(prisma);
    this.hotelController = require("./controllers/hotel")(prisma);
    this.foodController = require("./controllers/food")(prisma);
    this.cartController = require("./controllers/cart")(prisma);
    this.orderController = require("./controllers/order")(prisma);
  }

  initRoutes() {
    const authMiddleWare = require("./middlewares/auth.middleware");
    app.use(authMiddleWare);

    const userRouter = require("./routes/user")(this.userController);
    const hotelRouter = require("./routes/hotel")(this.hotelController);
    const foodRouter = require("./routes/food")(this.foodController);
    const fileUpload = require("./routes/fileUpload")(this.foodController);
    const cartRouter = require("./routes/cart")(this.cartController);
    const orderRouter = require("./routes/order")(this.orderController);

    app.use(express.static("profile"));
    app.use("/api/user", userRouter.getRouter());
    app.use("/api/hotel", hotelRouter.getRouter());
    app.use("/api/food", foodRouter.getRouter());
    app.use("/api/cart", cartRouter.getRouter());
    app.use("/api/upload", fileUpload.getRouter());
    app.use("/api/order", orderRouter.getRouter());
  }

  onClose() {
    //Close all DB Connections
    this.drivers.map((m) => {
      m.close();
    });

    HttpServer.close();
  }

  initExpress() {
    // if (isDev) {
    app.use(require("cors")());
    // }
    const colours = {
      GET: "\x1b[32m",
      POST: "\x1b[34m",
      DELETE: "\x1b[31m",
      PUT: "\x1b[33m",
    };
    app.use("*", (req, _, next) => {
      console.log(colours[req.method] + req.method, "\x1b[0m" + req.baseUrl);
      next();
    });

    app.use(compression());
    app.use(bodyParser.json({ limit: "2mb" }));
    app.use(
      bodyParser.urlencoded({
        limit: "2mb",
        extended: true,
      })
    );
    // to serve static files
    app.use(express.static(__dirname + "/static", { maxAge: "30 days" }));
  }

  initServer() {
    httpServer.listen({ port: config.port }, () => {
      console.log(
        "🚀 Server ready at",
        `http${config.ssl ? "s" : ""}://${config.hostname}:${config.port}`
      );
    });
  }

  onClose() {
    //Close all DB Connections
    this.drivers.map((m) => {
      m.close();
    });

    httpServer.close();
  }
}

const server = new Server();

["SIGINT", "SIGTERM", "SIGQUIT"].forEach((eventType) => {
  process.on(eventType, (err) => {
    server.onClose();
    //to avoid executing multiple times
    server.onClose = () => {};
    process.exit(-1);
  });
});
