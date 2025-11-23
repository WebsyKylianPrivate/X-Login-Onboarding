import { Router } from "express";
import checkRoutes from "./check";
import buyRoutes from "./buy";
import purchasesRoutes from "./purchases";

const router = Router();

router.use("/", checkRoutes);
router.use("/", buyRoutes);
router.use("/", purchasesRoutes);

export default router;

