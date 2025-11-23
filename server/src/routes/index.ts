// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth";
import jobsRoutes from "./jobs";
import healthRoutes from "./health";
import botRoutes from "./bot";
import walletRoutes from "./wallet/check";

const router = Router();

// Routes
router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/jobs", jobsRoutes);
router.use("/bot", botRoutes);
router.use("/wallet", walletRoutes);

export default router;
