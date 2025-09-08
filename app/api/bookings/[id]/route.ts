import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// PATCH 用（部分更新）スキーマ
const patchSchema = z
  .object({
    // 予約の持ち主を差し替えたい場合（emailだけ or name+email）
    userName: z.string().min(1).optional(),
    userEmail: z.string().email().optional(),

    // 予約対象や時間の変更
    roomId: z.coerce.number().int().positive().optional(),
    start: z.coerce.date().optional(),
    end: z.coerce.date().optional(),
  })
  .refine((v) => !(v.start && v.end) || v.end > v.start, {
    path: ["end"],
    message: "終了時刻は開始時刻より後である必要があります",
  });

function parseId(params: { id?: string }) {
  const idNum = Number(params?.id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    throw new Error("Invalid id");
  }
  return idNum;
}

/** DELETE /api/bookings/:id */
export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  try {
    const id = parseId(ctx.params);
    const deleted = await prisma.booking.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (e: any) {
    // レコードなし → 404
    if (e?.code === "P2025") {
      return NextResponse.json(
        { message: "予約が見つかりませんでした" },
        { status: 404 }
      );
    }
    // idパースなど
    if (e?.message === "Invalid id") {
      return NextResponse.json({ message: "不正なIDです" }, { status: 400 });
    }
    return NextResponse.json(
      { message: "削除に失敗しました" },
      { status: 500 }
    );
  }
}

/** PATCH /api/bookings/:id  （重複チェックあり） */
export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    const id = parseId(ctx.params);
    const body = await req.json();
    const patch = patchSchema.parse(body);

    // 既存予約を取得（差分用）
    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: "予約が見つかりませんでした" },
        { status: 404 }
      );
    }

    // 更新後の想定値（未指定は既存値を引き継ぐ）
    const nextRoomId = patch.roomId ?? existing.roomId;
    const nextStart = patch.start ?? existing.start;
    const nextEnd = patch.end ?? existing.end;

    // 時間帯の重複チェック（自分自身は除外）
    const overlap = await prisma.booking.findFirst({
      where: {
        roomId: nextRoomId,
        id: { not: id },
        NOT: [
          { end: { lte: nextStart } }, // 完全に前
          { start: { gte: nextEnd } }, // 完全に後
        ],
      },
      select: { id: true },
    });
    if (overlap) {
      return NextResponse.json(
        { message: "同時間帯に同じ会議室の予約がすでに存在します。" },
        { status: 409 }
      );
    }

    // ユーザー差し替え（email が来たら upsert して userId を更新）
    let nextUserId: number | undefined = undefined;
    if (patch.userEmail) {
      const user = await prisma.user.upsert({
        where: { email: patch.userEmail },
        update: patch.userName ? { name: patch.userName } : {},
        create: {
          email: patch.userEmail,
          name: patch.userName ?? "User",
        },
      });
      nextUserId = user.id;
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        roomId: nextRoomId,
        start: nextStart,
        end: nextEnd,
        ...(nextUserId ? { userId: nextUserId } : {}),
      },
      include: { room: true, user: true },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.message === "Invalid id") {
      return NextResponse.json({ message: "不正なIDです" }, { status: 400 });
    }
    if (e?.issues) {
      // zod バリデーション
      return NextResponse.json(
        { message: "入力が不正です", details: e.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "更新に失敗しました" },
      { status: 500 }
    );
  }
}
