const { expressjwt } = require("express-jwt");

module.exports = expressjwt({
  secret: process.env.TOKEN_SIGN_SECRET,
  algorithms: ["HS256"],
});
