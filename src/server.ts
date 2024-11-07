import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./config/database";

const PORT = process.env.API_PORT;

AppDataSource.initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running...`);
    });
  })
  .catch((error) =>
    console.error("Error during Data Source initialization", error)
  );
