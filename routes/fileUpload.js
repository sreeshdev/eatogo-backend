const router = require("express").Router();
var multer = require("multer");

class fileUpload {
  constructor(controller) {
    this.controller = controller;

    this.init();
  }
  init() {
    var storage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, "profile");
      },
      filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
      },
    });
    var upload = multer({ storage: storage }).array("file");
    router.post("/", async (req, res) => {
      try {
        await upload(req, res, function(err) {
          if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
          } else if (err) {
            return res.status(500).json(err);
          }
          console.log(req);
          res.json(req.files);
        });
      } catch (err) {
        res.json({ code: 500, msg: "An error occured" });
      }
    });
  }

  getRouter() {
    return router;
  }
}
module.exports = (controller) => {
  return new fileUpload(controller);
};
