const mongoose = require("mongoose");
const User = require("../models/UserModel");
const Franchise = require("../models/Franchise/FranchiseModel");
const Company = require("../models/Company/CompanyModel");

module.exports = async (req, res, next) => {
  try {
    userLooged = req.tokenUser;

    if (userLooged) {
      //get franchises by user logged
      const user = await User.findById(userLooged._id).select({
        isRoot: 1,
        franchise: 1,
        franchises: 1,
        companies: 1,
        company: 1,
        status: 1,
      });

      if (user) {
        //caso seja admin/super/root então consulta todas as franquias
        if (user.isRoot) {
          const franchises = await Franchise.find({
            deletedAt: { $exists: false },
          })
            .select({
              _id: 1,
            })
            .lean();

          req.isRoot = true;

          req.franchises = [null, ...(await franchises.map(i => i._id))];
          req.franchise = null;

          // consulta todas companies para o super root
          let companies = await Company.find({
            deletedAt: { $exists: false },
          })
            .select({
              _id: 1,
            })
            .lean();

          companies = await companies.map(i => i._id);

          req.companies = [null, ...companies];
          req.company = null;
        } else {
          // caso seja franquia ou empresa
          req.isRoot = false;
          req.isCompany = false;
          req.isFranchise = false;

          req.franchises = user.franchises;
          req.franchise = user.franchise;

          if (!user.franchises || user.franchises.length <= 0) {
            // caso seja usuario da empresa e não franquia

            req.isRoot = false;
            req.isCompany = true;
            req.isFranchise = false;

            req.company = user.company ? user.company : user.companies[0];
            req.companies = [];

            const company = await Company.findOne({
              _id: { $in: user.company },
            })
              .select({
                franchise: 1,
              })
              .lean();

            if (company && company.franchise) {
              req.franchises = [company.franchise];
              req.franchise = company.franchise;
            } else {
              req.franchises = [];
              req.franchise = null;
            }
          } else {
            // caso seja franquia
            req.isRoot = false;
            req.isCompany = false;
            req.isFranchise = true;

            // consulta as empresas da franquia
            const companies = await Company.find({
              franchise: { $in: user.franchise },
              deletedAt: { $exists: false },
            })
              .select({
                _id: 1,
              })
              .lean();

            if (user.company) {
              req.company = user.company;
            } else if (companies && Array.isArray(companies) && companies.length > 0) {
              req.company = companies[0]._id;
            }

            req.companies = await companies.map(i => i._id);
          }
        }
      } else {
        req.companies = [];
        req.company = null;
      }
    } else {
      req.companies = [];
      req.company = null;
    }

    next();
  } catch (err) {
    return res.status(501).json({ message: "Error in check franchises" }).end();
  }
};
