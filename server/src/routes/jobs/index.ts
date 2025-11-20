// src/routes/jobs/index.ts
import { Router } from "express";
import startRoutes from "./start";
import statusRoutes from "./status";
import commandRoutes from "./command";

const router = Router();

// Routes
router.use("/start", startRoutes);
router.use("/status", statusRoutes);
router.use("/command", commandRoutes);

export default router;
