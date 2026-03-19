const VoucherModel = require("../../models/Mobility/Payment/VoucherModel");

const getVoucherPrice = (price, voucher) => {
  let amount = 0;
  let priceWithVoucher = price;

  if (voucher?.price && voucher?.price > 0) {
    if (price <= voucher?.price) {
      amount = price;
      priceWithVoucher = 0;
    } else {
      amount = Number(Number(voucher?.price).toFixed(2));
      priceWithVoucher = Number(Number(price - amount).toFixed(2));
    }
  } else if (voucher?.percent && voucher?.percent > 0) {
    amount = price * (voucher?.percent / 100);
    amount = Number(Number(amount).toFixed(2));
    priceWithVoucher = Number(Number(price - amount).toFixed(2));
  }

  if (amount === 0) {
    return null;
  }

  return {
    _id: voucher?._id,
    total: amount,
    isPrice: voucher?.price && voucher?.price > 0 ? true : false,
    isPercent: voucher?.percent && voucher?.percent > 0 ? true : false,
    percent: voucher?.percent && voucher?.percent > 0 ? voucher?.percent : 0,
    priceWithVoucher,
  };
};

const checkVoucher = async voucherId => {
  try {
    const voucher = await VoucherModel.findById(voucherId).lean();

    if (!voucher || !voucher._id) {
      return;
    }

    if (voucher.type === "single") {
      return await VoucherModel.updateOne({ _id: voucherId }, { active: false });
    } else if (voucher.amountAvailable && voucher.amountUsed) {
      if (voucher.amountAvailable > voucher.amountUsed + 1) {
        return await VoucherModel.updateOne({ _id: voucherId }, { amountUsed: voucher.amountUsed + 1 });
      }

      return await VoucherModel.updateOne(
        { _id: voucherId },
        {
          amountUsed: voucher.amountUsed + 1,
          active: false,
        },
      );
    }

    return;
  } catch (err) {
    return null;
  }
};

module.exports = {
  getVoucherPrice,
  checkVoucher,
};
