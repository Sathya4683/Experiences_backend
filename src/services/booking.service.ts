import prisma from "../db/prisma";
import { BookExperienceInput } from "../validators/booking.validator";

export const bookExperienceService = async (
  experienceId: string,
  userId: string,
  userRole: string,
  data: BookExperienceInput,
) => {
  const experience = await prisma.experience.findUnique({
    where: { id: experienceId },
  });

  if (!experience) {
    throw { status: 404, code: "NOT_FOUND", message: "Experience not found" };
  }

  //Cannot book if it's not published
  if (experience.status !== "published") {
    throw {
      status: 400,
      code: "NOT_PUBLISHED",
      message: "Only published experiences can be booked",
    };
  }

  //Hosts can't book their own experiences; it's just bad UX + business logic
  if (userRole === "host" && experience.created_by === userId) {
    throw {
      status: 403,
      code: "FORBIDDEN",
      message: "Hosts cannot book their own experiences",
    };
  }

  //We are checking for an existing confirmed booking to prevent duplicates
  const existingBooking = await prisma.booking.findFirst({
    where: {
      experience_id: experienceId,
      user_id: userId,
      status: "confirmed",
    },
  });

  if (existingBooking) {
    throw {
      status: 400,
      code: "DUPLICATE_BOOKING",
      message: "You already have a confirmed booking for this experience",
    };
  }

  const booking = await prisma.booking.create({
    data: {
      experience_id: experienceId,
      user_id: userId,
      seats: data.seats,
      status: "confirmed",
    },
  });

  return booking;
};
