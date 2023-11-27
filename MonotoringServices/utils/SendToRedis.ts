import { Request, Response } from "express";
import RedisConfig from "../redis/IoRedisClient";

const sendMessageToRedis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const redisConfig = RedisConfig.getInstance();
    await redisConfig.produce("DATA_QUEUE", message);

    res.status(200).json({
      status: "Ok!",
      message: "Message successfully sent!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "Error",
      message: "Internal Server Error",
    });
  }
};

const controllers = { sendMessageToRedis };

export default controllers;
