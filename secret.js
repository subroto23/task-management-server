require("dotenv").config();

const PortNumber = process.env.PORT || process.env.SERVER_PORT;
const MONGODB_URL = process.env.MONGODB_URL_CONNECTIONS;

const ACCESS_TOKEN_KEY_VALUE = process.env.ACCESS_TOKEN_KEY;

module.exports = {
  PortNumber,
  MONGODB_URL,
  ACCESS_TOKEN_KEY_VALUE,
};
