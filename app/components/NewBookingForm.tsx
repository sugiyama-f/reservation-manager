"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  MenuItem,
  Stack,
  TextField,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import type { Room } from "../types";
import { toTokyoISO } from "@/lib/time";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  rooms: Room[];
  dateISO: string; // "YYYY-MM-DD"
  onCreated: () => void; // 予約作成後に一覧再取得
};

export default function NewBookingForm({ rooms, dateISO, onCreated }: Props) {
  const [roomId, setRoomId] = useState<number | "">(() => rooms[0]?.id ?? "");
  const [userName, setUserName] = useState("Demo User");
  const [userEmail, setUserEmail] = useState("demo@example.com");
  const [startTime, setStartTime] = useState<Dayjs | null>(
    dayjs().hour(10).minute(0)
  );
  const [endTime, setEndTime] = useState<Dayjs | null>(
    dayjs().hour(11).minute(0)
  );
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!roomId || !startTime || !endTime) return;
    setCreating(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName,
          userEmail,
          roomId,
          start: toTokyoISO(dateISO, startTime.format("HH:mm")),
          end: toTokyoISO(dateISO, endTime.format("HH:mm")),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message ?? "作成に失敗しました");
      }
      onCreated();
    } finally {
      setCreating(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card>
        <CardHeader title="新規予約" />
        <Divider />
        <CardContent>
          <Stack spacing={2}>
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

            <TextField
              label="予約者名"
              size="small"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            <TextField
              label="メール"
              type="email"
              size="small"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TimePicker
                label="開始"
                value={startTime}
                onChange={setStartTime}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
              <TimePicker
                label="終了"
                value={endTime}
                onChange={setEndTime}
                slotProps={{ textField: { size: "small", fullWidth: true } }}
              />
            </Stack>

            <Box>
              <Button
                variant="contained"
                startIcon={
                  creating ? <CircularProgress size={16} /> : <AddIcon />
                }
                onClick={handleCreate}
                disabled={creating || !roomId || !startTime || !endTime}
              >
                予約する
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}
