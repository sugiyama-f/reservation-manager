"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import type { Booking, Room } from "../types";
import { isoToTokyoTime, toTokyoISO } from "@/lib/time";

type Props = {
  open: boolean;
  target: Booking | null;
  rooms: Room[];
  dateISO: string; // "YYYY-MM-DD"
  onClose: () => void;
  onSaved: () => void; // 保存後に一覧再取得
};

export default function EditBookingDialog({
  open,
  target,
  rooms,
  dateISO,
  onClose,
  onSaved,
}: Props) {
  const [roomId, setRoomId] = useState<number | "">("");
  const [start, setStart] = useState<Dayjs | null>(null);
  const [end, setEnd] = useState<Dayjs | null>(null);
  const [saving, setSaving] = useState(false);

  // ターゲット変更時に初期化
  useEffect(() => {
    if (!target) return;
    setRoomId(target.room.id);

    const toDayjs = (iso: string) => {
      const [HH, MM] = isoToTokyoTime(iso).split(":").map(Number);
      return dayjs(dateISO).hour(HH).minute(MM);
    };
    setStart(toDayjs(target.start));
    setEnd(toDayjs(target.end));
  }, [target, dateISO]);

  const disabled = useMemo(
    () => !roomId || !start || !end,
    [roomId, start, end]
  );

  const handleSave = async () => {
    if (!target || disabled) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bookings/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          start: toTokyoISO(dateISO, start!.format("HH:mm")),
          end: toTokyoISO(dateISO, end!.format("HH:mm")),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message ?? "更新に失敗しました");
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>予約を編集{target && `（ID: ${target.id}）`}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              select
              label="会議室"
              size="small"
              value={roomId}
              onChange={(e) => setRoomId(Number(e.target.value))}
            >
              {rooms.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}（定員{r.capacity}）
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TimePicker
                label="開始"
                value={start}
                onChange={setStart}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
              <TimePicker
                label="終了"
                value={end}
                onChange={setEnd}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>キャンセル</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={disabled || saving}
          >
            {saving ? <CircularProgress size={18} /> : "保存"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
