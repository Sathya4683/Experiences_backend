import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import prisma from "../src/db/prisma";

//Clean up DB between tests so they don't bleed into each other
export const cleanDb = async () => {
  await prisma.booking.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.user.deleteMany();
};

export { prisma };
