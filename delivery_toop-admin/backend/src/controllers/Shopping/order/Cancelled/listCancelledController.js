const mongoose = require("mongoose");
const OrderStatus = require("../../../../models/Shopping/order/orderStatusModel");

const list = async (req, res) => {
    const { company } = req.params;

    if (!company || !mongoose.isValidObjectId(company)) {
        return res.status(404).send({
            message: 'Não encontrado!!'
        });
    }

    const order = await OrderStatus.find({
        company: company,
        status: 'CANCELED'
    });

    return res.status(200).send(order);
}

module.exports = { list }