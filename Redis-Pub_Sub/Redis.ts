import { RedisClientType, createClient } from "redis";
import { Counter } from "prom-client";

export class Redis {
  private client: RedisClientType;
  private static instance: Redis;
  private counter: Counter;

  private constructor() {
    this.client = createClient();
    this.client.connect();
    this.client.on("connect", (err) => {
      if (err) {
        console.error(err);
      }
      console.log("Redis connected");
    });
    this.counter = new Counter({
      name: "redis_messages_sent",
      help: "Total number of messages sent to Redis",
    });
  }

  public static getInstance(): Redis {
    if (!Redis.instance) {
      Redis.instance = new Redis();
    }
    return Redis.instance;
  }

  async fetch(): Promise<string> {
    const response = await this.client.lPop("DATA_QUEUE");
    return response || "";
  }

  async sendQueue(message: string) {
    await this.client.rPush("DATA_QUEUE", message);
    await this.client.expire("DATA_QUEUE", 30);
    this.counter.inc(); // Increment the counter when a message is sent
  }

  async subscribe() {
    await this.client.subscribe("DATA_QUEUE", (err, count) => {
      if (err) {
        console.error(err);
      }
      console.log(`Subscribed to ${count} channel(s)`);
    });
  }

  async produce(message: string, channelName: string) {
    await this.client.publish(channelName, message);
    this.counter.inc(); // Increment the counter when a message is produced
  }

  async consume(
    channel: string,
    callback: (message: string) => void
  ): Promise<void> {
    await this.client.subscribe(channel, (err, count) => {
      if (err) {
        console.log("🔴 Error subscribing to channel:", err);
      } else {
        console.log(
          `🟢 Subscribed to ${count} channel. Listening for updates on the ${channel} channel.`
        );
      }
    });

    this.client.on("message", (ch, message) => {
      if (channel === ch) {
        callback(message);
      }
    });
  }
  getCounter() {
    return this.counter;
  }

  // async consumeAndAggregate(channelName: string, collection: any) {
  //   const batchSize = 20; // Adjust as needed
  //   const aggregationInterval = 4000; // 5 seconds (adjust as needed)
  //   var logBatch: any[] = [];

  //   await this.client.subscribe(channelName, (err, count) => {
  //     if (err) {
  //       console.error(err);
  //     }
  //     console.log(`Subscribed to ${count} channel(s)`);
  //   });

  //   this.client.on("message", async (ch, message) => {
  //     if (ch !== channelName) {
  //       return;
  //     }

  //     console.log(`Received ${message} from ${ch}`);

  //     const logData = JSON.parse(message);
  //     logBatch.push(logData);

  //     // Check if batch size is reached or aggregation interval elapsed
  //     if (
  //       logBatch.length >= batchSize ||
  //       (logBatch.length > 0 &&
  //         Date.now() - logBatch[0].timestamp >= aggregationInterval)
  //     ) {
  //       // Batch insertion into MongoDB
  //       await collection.insertMany(logBatch);
  //       console.log("Inserted batch into MongoDB");

  //       // Clear the batch
  //       logBatch = [];
  //     }
  //   });
  // }
}
