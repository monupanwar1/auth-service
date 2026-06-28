import app from "./src/app";
import { Config } from "./src/config";
import logger from "./src/config/logger";

const startServer = async () => {
  const PORT = Config.PORT || 5503;

  try {
    // await connectDB();

    app
      .listen(PORT, () => console.log(`Listening on port ${PORT}`))
      .on("error", (err) => {
        console.log("err", err.message);
        process.exit(1);
      });
  } catch (err) {
    logger.error("Error happened: ", err.message);
    process.exit(1);
  }
};

void startServer();
