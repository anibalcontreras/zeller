import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || undefined,
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT
    ? Number(process.env.DATABASE_PORT)
    : undefined,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false, // Cambia a false en producción y usa migraciones
  entities: [__dirname + "/../models/*.ts"],
});
