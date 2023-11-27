import { Redis, RedisOptions } from "ioredis";
require("dotenv").config();

class RedisConfig {
  private redis: Redis;
  private static instance: RedisConfig;
  private constructor(options?: RedisOptions) {
    const PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
    const HOST = process.env.REDIS_HOST || "";
    const password = process.env.REDIS_PASSWORD || "";
    const Enviroment = process.env.NODE_ENV || "development";
    if (Enviroment === "production") {
      this.redis = new Redis(PORT, HOST, { password });
      console.log("🟢 Connecting to production_redis");
      return;
    } else {
      this.redis = new Redis();
      console.log("🟢 Connecting to local_redis");
    }
  }
  static getInstance(options?: RedisOptions): RedisConfig {
    if (!RedisConfig.instance) {
      RedisConfig.instance = new RedisConfig(options);
    }
    return RedisConfig.instance;
  }
  async consume(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    await this.redis.subscribe(channel, (err, count) => {
      if (err) {
        console.log("🔴 Error subscribing to channel:", err);
      } else {
        console.log(
          `🟢 Subscribed to ${count} channel. Listening for updates on the ${channel} channel.`
        );
      }
    });

    this.redis.on("message", (ch, message) => {
      if (channel === ch) {
        callback(message);
      }
    });
  }

  async produce(channel: string, message: string): Promise<void> {
    await this.redis.publish(channel, message);
  }
  async consumeAndAggregate(channelName: string, collection: any) {
    const batchSize = 20; // Adjust as needed
    const aggregationInterval = 4000; // 5 seconds (adjust as needed)
    var logBatch: any[] = [];

    await this.redis.subscribe(channelName, (err, count) => {
      if (err) {
        console.error(err);
      }
      console.log(`Subscribed to ${count} channel(s)`);
    });

    this.redis.on("message", async (ch, message) => {
      if (ch !== channelName) {
        return;
      }

      console.log(`Received ${message} from ${ch}`);

      const logData = JSON.parse(message);
      logBatch.push(logData);

      // Check if batch size is reached or aggregation interval elapsed
      if (
        logBatch.length >= batchSize ||
        (logBatch.length > 0 &&
          Date.now() - logBatch[0].timestamp >= aggregationInterval)
      ) {
        // Batch insertion into MongoDB
        await collection.insertMany(logBatch);
        console.log("Inserted batch into MongoDB");

        // Clear the batch
        logBatch = [];
      }
    });
  }

  async push_queue(queue: string, message: string): Promise<void> {
    await this.redis.rpush(queue, message);
  }
  async pop_queue(queue: string): Promise<string | null> {
    return await this.redis.lpop(queue);
  }
  get_QueueLength(queue: string): Promise<number> {
    return this.redis.llen(queue);
  }
}

export default RedisConfig;
