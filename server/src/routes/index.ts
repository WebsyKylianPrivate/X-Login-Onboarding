// src/routes/index.ts
import { Router } from "express";
import authRoutes from "./auth";
import jobsRoutes from "./jobs";
import healthRoutes from "./health";

const router = Router();

// Routes
router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/jobs", jobsRoutes);

export default router;
