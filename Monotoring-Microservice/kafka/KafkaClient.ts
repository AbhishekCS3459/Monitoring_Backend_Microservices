import { Kafka, Consumer, Producer, Message } from "kafkajs";
import { Counter } from "prom-client";

export class KafkaService {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;
  private static instance: KafkaService;
  private counter: Counter;
  public clientId: string;
  public brokers: string[];

  private constructor(clientId: string, brokers: string[]) {
    this.clientId = clientId;
    this.brokers = brokers;
    this.kafka = new Kafka({
      clientId: "Data-Producer",
      brokers: ["192.168.29.163:9092"], // Replace with your Kafka broker addresses
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
    });
    this.producer.connect();
    this.producer.on("producer.connect", async () => {
      console.log("🟢 Kafka Producer connected");
    });
    this.consumer = this.kafka.consumer({ groupId: "DATA_QUEUE" });

    this.consumer.connect();

    this.consumer.on("consumer.connect", async () => {
      console.log("🟢 Kafka Consumer connected");
    });
    this.counter = new Counter({
      name: "kafka_messages_sent",
      help: "Total number of messages sent to Kafka",
    });
  }

  public static getKafkaInstance(
    clientId: string,
    brokers: string[]
  ): KafkaService {
    if (!KafkaService.instance) {
      KafkaService.instance = new KafkaService(clientId, brokers);
    }
    return KafkaService.instance;
  }

  async Kafkaconnect() {
    await this.producer.connect();
    await this.consumer.connect();
  }

  async Kafkadisconnect() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async ProduceKafka(topic: string, message: string) {
    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });
    console.log("Sent message: " + message);
    this.counter.inc();
  }

  async consumeKafka(topic: string, callback: (message: Message) => void) {
    await this.consumer.subscribe({ topic, fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        console.log(`Received message: ${message.value}`);
        this.counter.inc();
        callback(message);
      },
    });
  }

  getKafkaCounter() {
    return this.counter;
  }
}
