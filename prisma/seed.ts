import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

//Wrapping in an async IIFE so we can use await at the top level
async function main() {
  console.log("🌱 Starting seed...\n");

  //Wipe existing data in the right order to avoid FK violations
  await prisma.booking.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleared existing data\n");

  // =====================================================
  // USERS
  // =====================================================

  const hash = (pw: string) => bcrypt.hash(pw, 12);

  //All test passwords follow the pattern shown below so they're easy to remember
  const [
    adminHash,
    host1Hash,
    host2Hash,
    host3Hash,
    user1Hash,
    user2Hash,
    user3Hash,
  ] = await Promise.all([
    hash("Admin@1234"),
    hash("Host@1234"),
    hash("Host@1234"),
    hash("Host@1234"),
    hash("User@1234"),
    hash("User@1234"),
    hash("User@1234"),
  ]);

  //Admin accounts cannot self-register through the API, so we seed them here
  const admin = await prisma.user.create({
    data: {
      email: "admin@yoliday.com",
      password_hash: adminHash,
      role: "admin" as const,
    },
  });

  const host1 = await prisma.user.create({
    data: {
      email: "priya.sharma@host.com",
      password_hash: host1Hash,
      role: "host" as const,
    },
  });

  const host2 = await prisma.user.create({
    data: {
      email: "arjun.mehta@host.com",
      password_hash: host2Hash,
      role: "host" as const,
    },
  });

  const host3 = await prisma.user.create({
    data: {
      email: "sara.dsouza@host.com",
      password_hash: host3Hash,
      role: "host" as const,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: "rahul.nair@user.com",
      password_hash: user1Hash,
      role: "user" as const,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "meera.pillai@user.com",
      password_hash: user2Hash,
      role: "user" as const,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "dev.patel@user.com",
      password_hash: user3Hash,
      role: "user" as const,
    },
  });

  console.log("👤 Users created:");
  console.log(`   ADMIN  → admin@yoliday.com          / Admin@1234`);
  console.log(`   HOST   → priya.sharma@host.com      / Host@1234`);
  console.log(`   HOST   → arjun.mehta@host.com       / Host@1234`);
  console.log(`   HOST   → sara.dsouza@host.com       / Host@1234`);
  console.log(`   USER   → rahul.nair@user.com        / User@1234`);
  console.log(`   USER   → meera.pillai@user.com      / User@1234`);
  console.log(`   USER   → dev.patel@user.com         / User@1234\n`);

  // =====================================================
  // EXPERIENCES
  // =====================================================

  //Mix of statuses so we can test all the moderation flows
  const exp1 = await prisma.experience.create({
    data: {
      title: "Sunrise Yoga on Varkala Cliff",
      description:
        "Start your morning with a 90-minute yoga session on the famous Varkala clifftop. Overlooking the Arabian Sea, you'll do breathwork, asanas, and end with a guided meditation. All levels welcome. Mats provided.",
      location: "Varkala, Kerala",
      price: 1200,
      start_time: new Date("2025-08-10T06:00:00.000Z"),
      status: "published" as const,
      created_by: host1.id,
    },
  });

  const exp2 = await prisma.experience.create({
    data: {
      title: "Spice Plantation Trek & Cooking Class",
      description:
        "Walk through a working cardamom and pepper plantation in Wayanad with a local farmer as your guide. After the trek, join his family in their kitchen to cook a traditional Kerala sadya from scratch. You'll eat what you cook.",
      location: "Wayanad, Kerala",
      price: 3500,
      start_time: new Date("2025-09-05T08:00:00.000Z"),
      status: "published" as const,
      created_by: host1.id,
    },
  });

  const exp3 = await prisma.experience.create({
    data: {
      title: "Old Goa Heritage Walk & Feni Tasting",
      description:
        "A 3-hour guided walk through Old Goa's UNESCO-listed churches and colonial-era ruins. Ends at a local cashew farm for an introduction to traditional feni distillation and a tasting session.",
      location: "Goa",
      price: 1800,
      start_time: new Date("2025-08-20T09:00:00.000Z"),
      status: "published" as const,
      created_by: host2.id,
    },
  });

  const exp4 = await prisma.experience.create({
    data: {
      title: "Surfing Beginner Bootcamp - Arambol Beach",
      description:
        "Two-day surfing beginner bootcamp at Arambol Beach. Includes theory session, beach drills, and water sessions each day. All equipment provided. Group limited to 8 people for max attention.",
      location: "Goa",
      price: 6500,
      start_time: new Date("2025-10-12T07:00:00.000Z"),
      status: "published" as const,
      created_by: host2.id,
    },
  });

  const exp5 = await prisma.experience.create({
    data: {
      title: "Backwater Kayaking in Alleppey",
      description:
        "A 4-hour solo kayaking trip through the Alleppey backwaters. You'll paddle past rice paddies, lotus ponds, and local fishing villages. Life jacket and guide kayak included. No prior experience needed.",
      location: "Alleppey, Kerala",
      price: 2200,
      start_time: new Date("2025-09-18T07:30:00.000Z"),
      status: "published" as const,
      created_by: host3.id,
    },
  });

  const exp6 = await prisma.experience.create({
    data: {
      title: "Mumbai Street Food Night Walk - Dharavi & Mohammed Ali Road",
      description:
        "A 3-hour guided night walk through Mumbai's most vibrant food streets. Try 12+ dishes across kebabs, biryanis, malpua, and local chaats. Small group, big flavours.",
      location: "Mumbai, Maharashtra",
      price: 1500,
      start_time: new Date("2025-08-30T19:00:00.000Z"),
      status: "published" as const,
      created_by: host3.id,
    },
  });

  //Draft experience - only visible to the host, not bookable
  const exp7 = await prisma.experience.create({
    data: {
      title: "Rann of Kutch Stargazing Camp",
      description:
        "Overnight camping in the white desert of Kutch. Astrophysicist-guided stargazing session with telescope access, followed by a traditional Gujarati dinner under the stars. Draft until permits are confirmed.",
      location: "Kutch, Gujarat",
      price: 8500,
      start_time: new Date("2025-11-15T18:00:00.000Z"),
      status: "draft" as const,
      created_by: host2.id,
    },
  });

  //Blocked experience - admin moderated it off the platform
  const exp8 = await prisma.experience.create({
    data: {
      title: "Restricted Forest Jeep Safari",
      description:
        "Off-road jeep trip into a protected forest zone. Blocked because the operator did not have the required wildlife authority permits at time of listing review.",
      location: "Coorg, Karnataka",
      price: 4000,
      start_time: new Date("2025-09-01T05:30:00.000Z"),
      status: "blocked" as const,
      created_by: host1.id,
    },
  });

  console.log("🎯 Experiences created:");
  console.log(`   [PUBLISHED] ${exp1.title} - ${exp1.location}`);
  console.log(`   [PUBLISHED] ${exp2.title} - ${exp2.location}`);
  console.log(`   [PUBLISHED] ${exp3.title} - ${exp3.location}`);
  console.log(`   [PUBLISHED] ${exp4.title} - ${exp4.location}`);
  console.log(`   [PUBLISHED] ${exp5.title} - ${exp5.location}`);
  console.log(`   [PUBLISHED] ${exp6.title} - ${exp6.location}`);
  console.log(`   [DRAFT]     ${exp7.title} - ${exp7.location}`);
  console.log(`   [BLOCKED]   ${exp8.title} - ${exp8.location}\n`);

  // =====================================================
  // BOOKINGS
  // =====================================================

  //Rahul books the yoga class and the kayaking trip
  const booking1 = await prisma.booking.create({
    data: {
      experience_id: exp1.id,
      user_id: user1.id,
      seats: 2,
      status: "confirmed" as const,
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      experience_id: exp5.id,
      user_id: user1.id,
      seats: 1,
      status: "confirmed" as const,
    },
  });

  //Meera books the street food walk and the spice trek
  const booking3 = await prisma.booking.create({
    data: {
      experience_id: exp6.id,
      user_id: user2.id,
      seats: 3,
      status: "confirmed" as const,
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      experience_id: exp2.id,
      user_id: user2.id,
      seats: 2,
      status: "confirmed" as const,
    },
  });

  //Dev booked the surfing bootcamp but then cancelled
  const booking5 = await prisma.booking.create({
    data: {
      experience_id: exp4.id,
      user_id: user3.id,
      seats: 1,
      status: "cancelled" as const,
    },
  });

  //Dev also has an active booking for the heritage walk
  const booking6 = await prisma.booking.create({
    data: {
      experience_id: exp3.id,
      user_id: user3.id,
      seats: 2,
      status: "confirmed" as const,
    },
  });

  //Admin also made a booking (admins can book too)
  const booking7 = await prisma.booking.create({
    data: {
      experience_id: exp5.id,
      user_id: admin.id,
      seats: 1,
      status: "confirmed" as const,
    },
  });

  console.log("📅 Bookings created:");
  console.log(`   rahul.nair    → "${exp1.title}" (2 seats, confirmed)`);
  console.log(`   rahul.nair    → "${exp5.title}" (1 seat, confirmed)`);
  console.log(`   meera.pillai  → "${exp6.title}" (3 seats, confirmed)`);
  console.log(`   meera.pillai  → "${exp2.title}" (2 seats, confirmed)`);
  console.log(`   dev.patel     → "${exp4.title}" (1 seat, cancelled)`);
  console.log(`   dev.patel     → "${exp3.title}" (2 seats, confirmed)`);
  console.log(`   admin         → "${exp5.title}" (1 seat, confirmed)\n`);

  // =====================================================
  // SUMMARY for easy curl testing
  // =====================================================

  console.log("=".repeat(60));
  console.log("SEED COMPLETE - Quick Reference IDs");
  console.log("=".repeat(60));
  console.log("\n--- USERS ---");
  console.log(`admin id  : ${admin.id}`);
  console.log(`host1 id  : ${host1.id}  (priya.sharma@host.com)`);
  console.log(`host2 id  : ${host2.id}  (arjun.mehta@host.com)`);
  console.log(`host3 id  : ${host3.id}  (sara.dsouza@host.com)`);
  console.log(`user1 id  : ${user1.id}  (rahul.nair@user.com)`);
  console.log(`user2 id  : ${user2.id}  (meera.pillai@user.com)`);
  console.log(`user3 id  : ${user3.id}  (dev.patel@user.com)`);

  console.log("\n--- EXPERIENCES ---");
  console.log(`[PUBLISHED] exp1 id : ${exp1.id}`);
  console.log(`[PUBLISHED] exp2 id : ${exp2.id}`);
  console.log(`[PUBLISHED] exp3 id : ${exp3.id}`);
  console.log(`[PUBLISHED] exp4 id : ${exp4.id}`);
  console.log(`[PUBLISHED] exp5 id : ${exp5.id}`);
  console.log(`[PUBLISHED] exp6 id : ${exp6.id}`);
  console.log(`[DRAFT]     exp7 id : ${exp7.id}  ← try to book this (should 400)`);
  console.log(`[BLOCKED]   exp8 id : ${exp8.id}  ← try to book this (should 400)`);

  console.log("\n--- BOOKINGS ---");
  console.log(`booking1 id : ${booking1.id}  (rahul on yoga, confirmed)`);
  console.log(`booking2 id : ${booking2.id}  (rahul on kayaking, confirmed)`);
  console.log(`booking3 id : ${booking3.id}  (meera on street food, confirmed)`);
  console.log(`booking4 id : ${booking4.id}  (meera on spice trek, confirmed)`);
  console.log(`booking5 id : ${booking5.id}  (dev on surfing, CANCELLED)`);
  console.log(`booking6 id : ${booking6.id}  (dev on heritage walk, confirmed)`);
  console.log(`booking7 id : ${booking7.id}  (admin on kayaking, confirmed)`);

  console.log("\n--- WHAT TO TEST ---");
  console.log("Auth:");
  console.log("  POST /auth/login  { email: 'admin@yoliday.com', password: 'Admin@1234' }");
  console.log("  POST /auth/login  { email: 'priya.sharma@host.com', password: 'Host@1234' }");
  console.log("  POST /auth/login  { email: 'rahul.nair@user.com', password: 'User@1234' }");
  console.log("\nExperiences:");
  console.log(`  GET  /experiences                     → 6 published results`);
  console.log(`  GET  /experiences?location=Goa        → 2 results (exp3 + exp4)`);
  console.log(`  GET  /experiences?sort=desc           → sorted by start_time DESC`);
  console.log(`  PATCH /experiences/${exp7.id.slice(0,8)}…/publish  → host2 can publish draft exp7`);
  console.log(`  PATCH /experiences/${exp3.id.slice(0,8)}…/block    → admin can block exp3`);
  console.log("\nBooking:");
  console.log(`  POST /experiences/${exp4.id.slice(0,8)}…/book  { seats: 1 }  → user books surfing (dev cancelled so no duplicate)`);
  console.log(`  POST /experiences/${exp7.id.slice(0,8)}…/book  { seats: 1 }  → should 400 (not published)`);
  console.log(`  POST /experiences/${exp1.id.slice(0,8)}…/book  { seats: 1 }  → as rahul should 400 (duplicate booking)`);
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
