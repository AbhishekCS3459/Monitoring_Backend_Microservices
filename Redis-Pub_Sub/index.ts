import mongoose from "mongoose";
import RedisConfig from "./IoRedisClient";
import MonitoringLogModel from "./model/MonitoringLogModel";

const redisClient = RedisConfig.getInstance();
console.log("🟢 Waiting message From");

function processLogs() {
  const batchSize = 10; // Adjust as needed
  const aggregationInterval = 60*1000; // 5 seconds (adjust as needed)
  let logBatch: any[] = [];
  let lastTimestamp: number = 0;
   
  redisClient.consume("DATA_QUEUE", async (message) => {
    const logData = JSON.parse(message);
    console.log("🟢 Parsed message:", logData);

    logBatch.push(logData);

    if (logBatch.length >= batchSize || (Date.now() - lastTimestamp) >= aggregationInterval) {
      await saveLogBatch(logBatch);
      logBatch = [];
      lastTimestamp = Date.now();
    }
  });
}

async function saveLogBatch(logBatch: any[]) {
  try {
    console.log("🟢 Saving batch:", logBatch);
    await MonitoringLogModel.insertMany(logBatch);
    console.log("🟢 Saved batch with length", logBatch.length);
  } catch (err) {
    console.log("🔴 Error saving batch:", err);
  }
}

mongoose
  .connect(process.env.DB_URL || "mongodb://localhost:27017/monitoring")
  .then(() => {
    console.log("🟢 Connected to MongoDB");
    processLogs();
  })
  .catch((err) => {
    console.error("🔴 Could not connect to MongoDB", err);
  });
