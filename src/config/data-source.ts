import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from ".";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },

  // todo change to false in prod
  // synchronize: false,
  synchronize: process.env.NODE_ENV === "test",
  dropSchema: process.env.NODE_ENV === "test",
  logging: false,
  entities: ["src/entity/*.{ts,js}"],
  migrations: ["src/migration/*.{ts,js}"],
  subscribers: [],
});
