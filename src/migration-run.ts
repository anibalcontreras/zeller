import { AppDataSource } from "./config/database";

AppDataSource.initialize()
  .then(async () => {
    await AppDataSource.runMigrations();
    console.log("Migrations executed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error executing migrations: ", error);
    process.exit(1);
  });
