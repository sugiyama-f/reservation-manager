import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  // Rooms
  const rooms = await prisma.$transaction([
    prisma.room.upsert({
      where: { name: "Room A" },
      update: {},
      create: { name: "Room A", capacity: 6 },
    }),
    prisma.room.upsert({
      where: { name: "Room B" },
      update: {},
      create: { name: "Room B", capacity: 10 },
    }),
    prisma.room.upsert({
      where: { name: "Room C" },
      update: {},
      create: { name: "Room C", capacity: 4 },
    }),
  ]);

  // Demo User (password: demo1234)
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: { name: "Demo User", passwordHash },
    create: { name: "Demo User", email: "demo@example.com", passwordHash },
  });

  // Sample booking: today 10:00-11:00 on Room A
  const today = new Date();
  today.setMinutes(0, 0, 0);
  const start = new Date(today);
  start.setHours(10);
  const end = new Date(today);
  end.setHours(11);

  await prisma.booking.upsert({
    where: { id: 1 },
    update: {},
    create: { userId: user.id, roomId: rooms[0].id, start, end },
  });

  console.log("Seed completed. login: demo@example.com / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
