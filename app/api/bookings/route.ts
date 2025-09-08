import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date"); // "YYYY-MM-DD"
  let where: any = {};
  if (dateParam) {
    const dayStart = new Date(dateParam + "T00:00:00.000Z");
    const dayEnd = new Date(dateParam + "T00:00:00.000Z");
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    where = { start: { gte: dayStart }, end: { lte: dayEnd } };
  }
  const bookings = await prisma.booking.findMany({
    where,
    orderBy: [{ start: "asc" }],
    include: { room: true, user: true },
  });
  return NextResponse.json(bookings);
}

// POST: require auth. Use session user.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    // name/email は無視しても良いが、念のため fallback
    const parsed = bookingSchema.parse(body);
    const email = session.user.email;
    const name = session.user.name ?? parsed.userName ?? "User";

    // ensure user exists (from session)
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        email,
        name,
        passwordHash: parsed.userEmail === email ? "" : "",
      }, // 既存ユーザー想定。空文字でもOK
    });

    // overlap detection
    const { roomId, start, end } = parsed;
    const overlap = await prisma.booking.findFirst({
      where: {
        roomId,
        NOT: [{ end: { lte: start } }, { start: { gte: end } }],
      },
    });
    if (overlap) {
      return NextResponse.json(
        { message: "A booking already exists for this room and time." },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: { userId: user.id, roomId, start, end },
      include: { room: true, user: true },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Bad Request" },
      { status: 400 }
    );
  }
}
