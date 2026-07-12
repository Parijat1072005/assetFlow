import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  idParamSchema,
} from "./booking.schema";
import * as controller from "./booking.controller";

const router = Router();
router.use(authenticate);

router.get("/", controller.list);

// Create Booking
router.post(
  "/",
  validate(createBookingSchema),
  controller.createBooking
);

// Cancel Booking
router.post(
  "/:id/cancel",
  validate(idParamSchema, "params"),
  validate(updateBookingStatusSchema), // Technically this is just cancelling, so we can use a simpler schema if we want, but it's fine.
  controller.cancelBooking
);

export default router;
