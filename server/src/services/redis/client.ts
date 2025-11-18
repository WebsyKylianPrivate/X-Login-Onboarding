import { createClient } from "redis";
import { config } from "./config/env";

export const redisClient = createClient({
  socket: {
    host: config.host,
    port: config.port,
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.error("❌ Redis: Max reconnection attempts reached. Please start Redis server.");
        return false; // Stop reconnecting
      }
      return Math.min(retries * 100, 3000);
    },
  },
  password: config.password,
  database: config.db,
});

redisClient.on("error", (err) => {
  if (err.code === "ECONNREFUSED") {
    console.error("❌ Redis: Connection refused. Is Redis server running?");
    console.error(`   Try: redis-server or docker run -p 6379:6379 redis`);
  } else {
    console.error("❌ Redis Client Error:", err.message);
  }
});

redisClient.on("connect", () => {
  console.log("🔌 Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("✅ Redis connected and ready");
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    throw error;
  }
};

export const disconnectRedis = async () => {
  try {
    await redisClient.disconnect();
    console.log("🔌 Redis disconnected");
  } catch (error) {
    console.error("Failed to disconnect from Redis:", error);
  }
};

