import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, signupSchema } from "../validators/auth.validator";

const router = Router();

//POST /auth/signup
router.post("/signup", validate(signupSchema), signup);

//POST /auth/login
router.post("/login", validate(loginSchema), login);

export default router;
