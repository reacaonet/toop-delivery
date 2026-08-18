let jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    let token = req.headers["x-access-token"] || req.headers["authorization"];

    if (
      token !== undefined &&
      token != null &&
      typeof token == "string" &&
      token.startsWith("Bearer ")
    ) {
      token = token.slice(7, token.length).trim();
    }

    // if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
      //if (err) {
      // next();
      //} else {
      req.tokenUser = decode;
      next();
      //}
    });

    // next();
    // } else {
    //   return res
    //     .status(401)
    //     .json({ success: false, message: "Not authorized" })
    //     .end();
    // }
  } catch (err) {
    return res.status(501).json({ message: "Not authorized" }).end();
  }
};
