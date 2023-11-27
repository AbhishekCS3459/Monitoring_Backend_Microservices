import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import client from "prom-client";
import responseTime from "response-time";
import { LokiLogger } from "./utils/LokiLogger";
import { ResponseTimeDb } from "./utils/DBMetrics";
import { totalReqCounter } from "./utils/ServerTotalReq";
import { reqResTime } from "./utils/reqResTime";
import { DbError } from "./utils/GenerateRandom";

import { RedisRead } from "./utils/RedisRead";
import { RedisreqResTime } from "./utils/redisReqResTime";
import RedisConfig from "./redis/IoRedisClient";
require("dotenv").config();
const app = express();
app.use(cors());
const PORT = process.env.PORT || 8000;
// writing logs to transport to loki
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({
  register: client.register,
});
app.use(bodyParser.json());

app.use(async (req, res, next) => {
  const start = Date.now();
  next();
  const end = Date.now();
  const elapsed = end - start;

  ResponseTimeDb.labels(req.method).observe(elapsed);
});

app.use(
  responseTime((req, res, time) => {
    totalReqCounter.inc();
    reqResTime
      .labels({
        method: req.method,
        route: req.url,
        status_code: res.statusCode,
      })
      .observe(time);
  })
);
app.use(
  responseTime((req, res, time) => {
    RedisRead.inc();
    RedisreqResTime.labels({
      method: req.method,
      route: req.url,
      status_code: res.statusCode,
    }).observe(time);
  })
);
const serverId = process.env.TZ || process.pid;
app.get("/", (req, res) => {
  res.send(`Server ${serverId} is up and running`);
});
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);
  const metrics = await client.register.metrics();
  const redisConfig = RedisConfig.getInstance();
  try {
    const infoMessage = {
      level: "info",
      timestamp: Date.now().toString(),
      message: "Metrics backup successful",
      resourceId: "your-resource-id",
      traceId: "abc-xyz-123",
      spanId: "span-456",
      commit: "5e5342f",
      metadata: {
        parentResourceId: "server-0987",
      },
    };

    await redisConfig.produce("DATA_QUEUE", JSON.stringify(infoMessage));
    LokiLogger.info(infoMessage);
  } catch (error: any) {
    const errorLogs = {
      level: "error",
      timestamp: Date.now().toString(),
      message: "Metrics backup failed",
      resourceId: "your-resource-id",
      traceId: "abc-xyz-123",
      spanId: "span-456",
      commit: "5e5342f",
      metadata: {
        parentResourceId: "server-0987",
      },
    };

    LokiLogger.error(errorLogs);
  }

  res.send(metrics);
});

app.get("/instant", (req, res) => {
  LokiLogger.info("req came on /fast route");
  res.json({ msg: "fast" });
});

app.get("/delay", async (req, res) => {
  try {
    LokiLogger.info("req came on /slow route");
    const timeTaken = await DbError();
    return res.json({ msg: timeTaken });
  } catch (error: any) {
    const errorLog = {
      level: "error",
      message: "error in slow route",
      resourceId: "nodejs server", 
      timestamp: new Date().toISOString(),
      traceId: "abc-xyz-123", 
      spanId: "span-456", 
      commit: "5e5342f", 
      metadata: {
        parentResourceId: "server-0987", 
      },
      errorDetails: {
        errorType: "InternalServerError",
        errorMessage: error.message,
        stackTrace: error.stack,
      },
    };

    LokiLogger.error(errorLog);

    return res.status(500).json({ msg: "internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
