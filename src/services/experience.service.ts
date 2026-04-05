import prisma from "../db/prisma";
import {
  CreateExperienceInput,
  ListExperiencesInput,
} from "../validators/experience.validator";

export const createExperienceService = async (
  data: CreateExperienceInput,
  userId: string,
) => {
  //New experiences always start as draft - host or admin decides when to publish
  const experience = await prisma.experience.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      price: data.price,
      start_time: new Date(data.start_time),
      created_by: userId,
      status: "draft",
    },
  });

  return experience;
};

export const publishExperienceService = async (
  id: string,
  userId: string,
  userRole: string,
) => {
  const experience = await prisma.experience.findUnique({ where: { id } });

  if (!experience) {
    throw { status: 404, code: "NOT_FOUND", message: "Experience not found" };
  }

  //We check ownership here; admins bypass this
  if (userRole !== "admin" && experience.created_by !== userId) {
    throw {
      status: 403,
      code: "FORBIDDEN",
      message: "You can only publish your own experiences",
    };
  }

  if (experience.status === "blocked") {
    throw {
      status: 400,
      code: "BLOCKED",
      message: "Blocked experiences cannot be published",
    };
  }

  return prisma.experience.update({
    where: { id },
    data: { status: "published" },
  });
};

export const blockExperienceService = async (id: string) => {
  const experience = await prisma.experience.findUnique({ where: { id } });

  if (!experience) {
    throw { status: 404, code: "NOT_FOUND", message: "Experience not found" };
  }

  return prisma.experience.update({
    where: { id },
    data: { status: "blocked" },
  });
};

export const listExperiencesService = async (filters: ListExperiencesInput) => {
  const { location, from, to, page, limit, sort } = filters;

  //Build the where clause dynamically based on what filters were passed
  const where: Record<string, unknown> = { status: "published" };

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (from || to) {
    where.start_time = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const skip = (page - 1) * limit;

  const [experiences, total] = await Promise.all([
    prisma.experience.findMany({
      where,
      orderBy: { start_time: sort },
      skip,
      take: limit,
      include: {
        creator: { select: { id: true, email: true } },
      },
    }),
    prisma.experience.count({ where }),
  ]);

  return {
    data: experiences,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
