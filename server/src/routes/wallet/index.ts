import { Router } from "express";
import checkRoutes from "./check";
import buyRoutes from "./buy";

const router = Router();

router.use("/", checkRoutes);
router.use("/", buyRoutes);

export default router;

