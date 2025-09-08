import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const patchSchema = z
  .object({
    userName: z.string().min(1).optional(),
    userEmail: z.string().email().optional(),
    roomId: z.coerce.number().int().positive().optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
  })
  .refine((v) => !(v.start && v.end) || v.end > v.start, {
    path: ["end"],
    message: "end must be after start",
  });

function parseId(params: { id?: string }) {
  const idNum = Number(params?.id);
  if (!Number.isFinite(idNum) || idNum <= 0) throw new Error("Invalid id");
  return idNum;
}

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const id = parseId(ctx.params);
    const deleted = await prisma.booking.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (e: any) {
    if (e?.code === "P2025")
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    if (e?.message === "Invalid id")
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  try {
    const id = parseId(ctx.params);
    const body = await req.json();
    const patch = patchSchema.parse(body);

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing)
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    const nextRoomId = patch.roomId ?? existing.roomId;
    const nextStart = patch.start ?? existing.start;
    const nextEnd = patch.end ?? existing.end;

    const overlap = await prisma.booking.findFirst({
      where: {
        roomId: nextRoomId,
        id: { not: id },
        NOT: [{ end: { lte: nextStart } }, { start: { gte: nextEnd } }],
      },
      select: { id: true },
    });
    if (overlap)
      return NextResponse.json(
        { message: "A booking already exists for this room and time." },
        { status: 409 }
      );

    const updated = await prisma.booking.update({
      where: { id },
      data: { roomId: nextRoomId, start: nextStart, end: nextEnd },
      include: { room: true, user: true },
    });
    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.message === "Invalid id")
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    if (e?.issues)
      return NextResponse.json(
        { message: "Invalid input", details: e.issues },
        { status: 400 }
      );
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}
