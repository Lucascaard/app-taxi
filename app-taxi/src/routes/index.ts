import { Router } from "express";
import { Request, Response } from "express";
import rideController from "../controllers/rideController";

const router = Router();

const handleEstimateRide = async (req: Request, res: Response) => {
  await rideController.estimateRide(req, res);
};

// Use a função na definição da rota
router.post("/ride/estimate", handleEstimateRide);

export default router;
