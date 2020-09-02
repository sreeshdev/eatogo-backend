const logger = require("../utils/logger");

class CompanyController {
  constructor(db) {
    this.db = db;

    this.modelFragment = `
  fragment HotelOnCreateJob on Hotel {
      id
      name
      locality
      cuisine
      url
      createdAt
  }
 `;
  }

  createHotel = (data, user) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { name, locality, cuisine, url } = data;
        const createHotel = await this.db
          .createHotel({
            name,
            locality,
            cuisine,
            url: {
              set: url,
            },
          })
          .$fragment(this.modelFragment);
        if (createHotel) {
          resolve({
            code: 200,
            message: "hotel created",
            data: createHotel,
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

  deleteCompany = (id, type, user) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (type === "SOFT") {
          const softDeleteUser = await this.db.updateCompany({
            where: {
              id,
            },
            data: {
              deletedBy: {
                connect: {
                  id: user,
                },
              },
              deletedAt: new Date(),
            },
          });

          if (softDeleteUser) {
            resolve({
              code: 200,
              message: "Company soft deleted.",
              data: null,
            });
          }
        } else if (type === "HARD") {
          const deleteUser = await this.db.deleteCompany({ id });
          if (deleteUser) {
            resolve({
              code: 200,
              message: "Company deleted permanently.",
            });
          }
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.COMPANY.deleteCompany",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error deleting company",
          data: err,
        });
      }
    });
  };
  getOne = (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        const company = await this.db
          .hotel({
            id,
          })
          .$fragment(this.modelFragment);
        if (company) {
          resolve({
            code: 200,
            message: "Fetched company",
            data: company,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.COMPANY.getOneCompany",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error getting company",
          data: err,
        });
      }
    });
  };
  getAll = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const company = await this.db.hotels().$fragment(this.modelFragment);
        console.log(company);
        if (company) {
          resolve({
            code: 200,
            message: "All companies Fetched",
            data: company,
          });
        }
      } catch (err) {
        logger.Log({
          level: logger.LEVEL.ERROR,
          component: "CONTROLLER.COMPANY.getAllCompany",
          code: "CONTROLLER.QUERY.ERROR",
          description: err.toString(),
          category: "",
          ref: {},
        });
        reject({
          code: 500,
          message: "error getting all company",
          data: err,
        });
      }
    });
  };
}

module.exports = (db) => {
  return new CompanyController(db);
};
