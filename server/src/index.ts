import express from "express";
import { config } from "@config/env";
import routes from "@routes";
import { logger } from "@middleware/logger";

const app = express();

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
