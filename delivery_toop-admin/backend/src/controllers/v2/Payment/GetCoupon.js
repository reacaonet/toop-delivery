const moment = require("moment");
const CouponModel = require("../../../models/Coupon/CouponModel");
const CompanyCoupon = require("../../../models/Coupon/CouponCompanyModel");
const LogModel = require("../../../models/LogModel");

const getCoupon = async (idCoupon, company) => {
  try {
    if (!idCoupon) {
      return null;
    }

    let filter = {};
    filter._id = idCoupon;
    filter.status = true;
    filter.dateInit = {
      $lte: moment().utc().startOf("day").toDate(),
    };

    filter.dateFinish = {
      $gte: moment().utc().startOf("day").toDate(),
    };

    let responseCoupon = await CouponModel.findOne(filter).select({ price: 1, allCompanies: 1 }).lean();

    if (!responseCoupon || !responseCoupon._id) {
      return null;
    }

    // verifica se é para todas as empresas
    if (responseCoupon.allCompanies) {
      return responseCoupon.price;
    }

    let response = await CompanyCoupon.findOne({
      coupon: responseCoupon._id,
      companies: {
        $in: [company],
      },
    }).lean();

    if (!response || !response._id) {
      return null;
    }

    return responseCoupon.price;
  } catch (err) {
  console.log("Fail", err);
    return null;
  }
};

module.exports = getCoupon;
