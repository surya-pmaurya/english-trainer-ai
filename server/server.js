import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

connectDatabase()
  .then(() =>
    app.listen(env.port, () =>
      console.info(`English Trainer AI API listening on port ${env.port}`),
    ),
  )
  .catch((error) => {
    console.error("Unable to start API:", error.message);
    process.exit(1);
  });
