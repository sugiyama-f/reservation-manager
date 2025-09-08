import { z } from "zod";

// ISO 文字列→Date 受け取りも許容
export const bookingSchema = z
  .object({
    userEmail: z.string().email(),
    userName: z.string().min(1),
    roomId: z.coerce.number().int().positive(),
    start: z.coerce.date(), // 例: "2025-09-09T10:00:00"
    end: z.coerce.date(),
  })
  .refine((v) => v.end > v.start, {
    message: "終了時刻は開始時刻より後である必要があります",
    path: ["end"],
  });
