"use client";

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Booking } from "../types";
import { isoToTokyoTime } from "@/lib/time";

type Props = {
  bookings: Booking[];
  loading: boolean;
  onEdit: (b: Booking) => void;
  onDelete: (id: number) => Promise<void>;
  deletingId: number | null;
};

export default function ReservationsList({
  bookings,
  loading,
  onEdit,
  onDelete,
  deletingId,
}: Props) {
  const sorted = [...bookings].sort((a, b) => a.start.localeCompare(b.start));

  return (
    <Card>
      <CardHeader
        title="予約一覧"
        subheader={loading ? "読み込み中..." : undefined}
      />
      <Divider />
      <CardContent>
        {sorted.length === 0 ? (
          <Typography color="text.secondary">
            この日の予約はありません。
          </Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={1}>
            {sorted.map((b) => (
              <Stack
                key={b.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                py={0.5}
                gap={2}
              >
                <Box>
                  <Typography fontWeight={600}>{b.room.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {b.user.name} ・ {isoToTokyoTime(b.start)}–
                    {isoToTokyoTime(b.end)}
                  </Typography>
                </Box>
                <Box>
                  <IconButton aria-label="edit" onClick={() => onEdit(b)}>
                    <EditOutlinedIcon />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    color="error"
                    onClick={() => onDelete(b.id)}
                    disabled={deletingId === b.id}
                  >
                    {deletingId === b.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <DeleteOutlineIcon />
                    )}
                  </IconButton>
                </Box>
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
