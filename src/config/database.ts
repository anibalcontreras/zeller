import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  ...(process.env.NODE_ENV === "production" && process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL } // In production, use DATABASE_URL
    : {
        host: process.env.DATABASE_HOST, // In development, use these values
        port: process.env.DATABASE_PORT
          ? Number(process.env.DATABASE_PORT)
          : undefined,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
      }),
  synchronize: process.env.NODE_ENV !== "production", // False in production
  logging: process.env.NODE_ENV !== "production",
  entities: [
    process.env.NODE_ENV === "production"
      ? __dirname + "/../models/*.js" // In production, use JS files
      : __dirname + "/../models/*.ts", // In development, use TS files
  ],
  migrations: [
    process.env.NODE_ENV === "production"
      ? "dist/migrations/*.js"
      : "src/migrations/*.ts",
  ],
  extra: {
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  },
});
