/** Model */
const CompanyModel = require("../models/Company/CompanyModel");

const getFranchise = async (latitude, longitude) => {
  try {
    if (!latitude || !longitude) {
      return false;
    }

    const isCompany = await CompanyModel.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: process.env.maxMeters,
        },
      },
      deletedAt: {
        $exists: false,
      },
    })
      .select({
        franchise: 1,
      })
      .lean();

    if (!isCompany || !isCompany.franchise) {
      return null;
    }

    return isCompany.franchise;
  } catch (err) {
    return false;
  }
};

module.exports = getFranchise;
