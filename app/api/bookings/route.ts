import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/zod";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date"); // 例: "2025-09-09"
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

// POST: 重複チェック = !(end <= s || start >= e) の存在確認
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = bookingSchema.parse(body);
    const { userEmail, userName, roomId, start, end } = parsed;

    // ユーザー upsert
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: { name: userName },
      create: { email: userEmail, name: userName },
    });

    // 重複（オーバーラップ）検知
    const overlap = await prisma.booking.findFirst({
      where: {
        roomId,
        NOT: [
          { end: { lte: start } }, // 既存予約の終了 <= 新規開始 → 非重複
          { start: { gte: end } }, // 既存予約の開始 >= 新規終了 → 非重複
        ],
      },
    });

    if (overlap) {
      return NextResponse.json(
        { message: "同時間帯に同じ会議室の予約がすでに存在します。" },
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
