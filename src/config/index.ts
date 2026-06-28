import { config } from "dotenv";
import path from "path";

config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || "dev"}`),
});

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);

const {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  CLIENT_UI_DOMAIN,
  ADMIN_UI_DOMAIN,
  MAIN_DOMAIN,
} = process.env;

export const Config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  REFRESH_TOKEN_SECRET,
  JWKS_URI,
  CLIENT_UI_DOMAIN,
  ADMIN_UI_DOMAIN,
  MAIN_DOMAIN,
};
