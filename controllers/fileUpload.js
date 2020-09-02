const logger = require("../utils/logger");
const s3 = require("../config/spaces");
const imagemin = require("imagemin");
const mozjpeg = require("imagemin-mozjpeg");
const imageminPngquant = require("imagemin-pngquant");
const sharp = require("sharp");
const isJpg = require("is-jpg");

class FileUploadController {
  constructor(db) {
    this.db = db;
  }

  spaceUpload = (params) => {
    return new Promise(async (resolve, reject) => {
      try {
        s3.upload(params, function(err, data) {
          //handle error
          if (err) {
            console.log("Error", err);
          }

          //success
          if (data) {
            console.log("Uploaded in:", data.Location);
            resolve(data);
          }
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  spaceRemove = (params) => {
    return new Promise(async (resolve, reject) => {
      try {
        s3.deleteObject(params, function(err, data) {
          if (err) console.log(err, err.stack);
          else {
            console.log(data);
            resolve(data);
          }
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }
    });
  };

  uploadImage = (file, body) => {
    return new Promise(async (resolve, reject) => {
      try {
        const buffer = file.buffer;
        const convertToJpg = async (input) => {
          if (isJpg(input)) {
            return input;
          }

          return sharp(input)
            .jpeg()
            .toBuffer();
        };
        let miniBuffer;
        if (file.mimetype === "image/jpeg") {
          miniBuffer = await imagemin.buffer(buffer, {
            plugins: [mozjpeg({ quality: 20 })],
          });
        } else if (file.mimetype === "image/png") {
          console.log("png");
          miniBuffer = await imagemin.buffer(buffer, {
            plugins: [
              imageminPngquant({
                quality: [0.5, 0.6],
              }),
            ],
          });
        }
        console.log(miniBuffer);

        if (body.module === "Vehicle Master" && body.type === "Vehicle Image") {
          var params = {
            Bucket: "nandiyamaha",
            ACL: "public-read",
            Body: miniBuffer,
            Key: `${process.env.SPACE_LOC}${body.master}/${body.module}/${
              body.id
            }/${body.type}/IMG-${body.color}-${file.originalname}`,
          };
        } else if (
          body.master === "Transaction Master" &&
          body.module === "Job Order"
        ) {
          var params = {
            Bucket: "nandiyamaha",
            ACL: "public-read",
            Body: miniBuffer,
            Key: `${process.env.SPACE_LOC}${body.master}/${body.module}/${
              body.id
            }/IMG-${body.type}-${Date.now()}-${file.originalname}`,
          };
        } else {
          var params = {
            Bucket: "nandiyamaha",
            ACL: "public-read",
            Body: miniBuffer,
            Key: `${process.env.SPACE_LOC}${body.master}/${body.module}/${
              body.id
            }/${body.type}/IMG-${Date.now()}-${file.originalname}`,
          };
        }
        const uploadUrl = await this.spaceUpload(params);
        if (uploadUrl) {
          resolve({
            code: 200,
            message: "Image uploaded",
            data: uploadUrl,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.imageUpload.images",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error creating Enquiry",
          data: err,
        });
      }
    });
  };
  uploadFile = (file, body) => {
    return new Promise(async (resolve, reject) => {
      try {
        const buffer = file.buffer;

        if (body.module === "Vehicle Master" && body.type === "Vehicle Image") {
          var params = {
            Bucket: "nandiyamaha",
            ACL: "public-read",
            Body: buffer,
            Key: `${process.env.SPACE_LOC}${body.master}/${body.module}/${
              body.id
            }/${body.type}/IMG-${body.color}-${file.originalname}`,
          };
        } else if (
          body.master === "Transaction Master" &&
          body.module === "Job Order"
        ) {
          var params = {
            Bucket: "nandiyamaha",
            ACL: "public-read",
            Body: buffer,
            Key: `${process.env.SPACE_LOC}${body.master}/${body.module}/${
              body.id
            }/IMG-${body.type}-${Date.now()}-${file.originalname}`,
          };
        } else if (
          body.master == "Transaction Master" &&
          body.module == "Booking"
        ) {
          const date = new Date();
          const year = date.getFullYear();
          let month = date.getMonth() + 1;
          const day = date.getDate();
          var params = {
            Bucket: "nandiyamaha",
            ACL: "public-read",
            Body: buffer,
            ContentType: "application/pdf",
            Key: `${process.env.SPACE_LOC}${body.master}/${
              body.module
            }/${year}/${month}/${day}/${body.id}/verified_${body.id}.pdf`,
          };
        } else {
          var params = {
            Bucket: "nandiyamaha",
            ACL: "public-read",
            Body: buffer,
            Key: `${process.env.SPACE_LOC}${body.master}/${body.module}/${
              body.id
            }/${body.type}/IMG-${Date.now()}-${file.originalname}`,
          };
        }
        const uploadUrl = await this.spaceUpload(params);
        if (uploadUrl) {
          resolve({
            code: 200,
            message: "File uploaded",
            data: uploadUrl,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.FileUpload.Files",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error creating Enquiry",
          data: err,
        });
      }
    });
  };
  RemoveFile = (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        var params = {
          Bucket: "nandiyamaha",
          Key: body.url,
        };
        const result = await this.spaceRemove(params);
        if (result) {
          resolve({
            code: 200,
            message: "File Deleted",
            data: result,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.filesRemove.Delete",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error creating Enquiry",
          data: err,
        });
      }
    });
  };
}

module.exports = (db) => {
  return new FileUploadController(db);
};
