const mongoose = require("mongoose");

const LogModel = require("../../../../../models/LogModel");

const validCreatePost = (data) => {
  try {
    if (!data.cartId || !mongoose.Types.ObjectId.isValid(data.cartId)) {
      return "Carrinho inválido";
    }

    if (!data.customer || !mongoose.Types.ObjectId.isValid(data.customer)) {
      return "Id do cliente inválido";
    }

    return null;
  } catch (err) {
    return "Verifique as informações enviadas e tente novamente";
  }
};

module.exports = validCreatePost;
