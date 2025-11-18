import 'dotenv/config';
import cors from "cors";
import express from "express";
import { config } from "@config/env";
import routes from "@routes";
import { logger } from "@middleware/logger";
import { connectRedis, disconnectRedis } from "@services/redis";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.0.7:5173",
      "https://websykylianprivate.github.io",
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Routes
app.use("/api", routes);
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Start server
const PORT = config.port || 3000;

// Initialize Redis connection
connectRedis().catch((error) => {
  console.error("Failed to initialize Redis:", error);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await disconnectRedis();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await disconnectRedis();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
