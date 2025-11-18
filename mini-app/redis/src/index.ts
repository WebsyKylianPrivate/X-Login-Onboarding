import { connectRedis, disconnectRedis } from "./client";

async function main() {
  try {
    await connectRedis();
    console.log("✅ Redis service started successfully");

    // Exemple d'utilisation
    // await redisClient.set("key", "value");
    // const value = await redisClient.get("key");

  } catch (error: any) {
    if (error?.code === "ECONNREFUSED") {
      console.error("\n❌ Cannot connect to Redis server.");
      console.error("   Please make sure Redis is running:");
      console.error("   - Install: brew install redis (macOS)");
      console.error("   - Start: redis-server");
      console.error("   - Or use Docker: docker run -p 6379:6379 redis\n");
    } else {
      console.error("❌ Error:", error?.message || error);
    }
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on("SIGINT", async () => {
  await disconnectRedis();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectRedis();
  process.exit(0);
});

