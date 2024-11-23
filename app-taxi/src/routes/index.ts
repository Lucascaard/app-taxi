import { Router } from "express";
import { Request, Response } from "express";
import rideController from "../controllers/rideController";

const router = Router();

const handleEstimateRide = async (req: Request, res: Response) => {
  await rideController.estimateRide(req, res);
};

const handleConfirm = async (req: Request, res: Response) => {
  await rideController.confirmRide(req, res);
};

const handleGetRides = async (req: Request, res: Response) => {
  await rideController.getRides(req, res);
} 

// Use a função na definição da rota
router.post("/ride/estimate", handleEstimateRide);
router.patch("/ride/confirm", handleConfirm);
router.get("/ride/:customer_id", handleGetRides);


export default router;
