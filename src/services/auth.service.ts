import bcrypt from "bcryptjs";
import prisma from "../db/prisma";
import { signToken } from "../utils/jwt";
import { LoginInput, SignupInput } from "../validators/auth.validator";

export const signupService = async (data: SignupInput) => {
  //We are checking if user already exists to avoid duplicates
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw {
      status: 400,
      code: "EMAIL_TAKEN",
      message: "Email is already registered",
    };
  }

  //This is being done to hash the password before storing
  const password_hash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password_hash,
      role: data.role,
    },
    select: { id: true, email: true, role: true, created_at: true },
  });

  return user;
};

export const loginService = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  //We throw a generic message to avoid leaking which emails exist
  if (!user) {
    throw {
      status: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password",
    };
  }

  const passwordMatch = await bcrypt.compare(data.password, user.password_hash);
  if (!passwordMatch) {
    throw {
      status: 401,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password",
    };
  }

  const token = signToken({ userId: user.id, role: user.role });

  return {
    token,
    user: { id: user.id, role: user.role },
  };
};
