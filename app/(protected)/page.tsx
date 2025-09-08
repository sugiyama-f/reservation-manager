"use client";

import { Container, Grid, Snackbar, Alert } from "@mui/material";
import HeaderBar from "@/app/components/HeaderBar";
import ReservationsList from "@/app/components/ReservationsList";
import NewBookingForm from "@/app/components/NewBookingForm";
import EditBookingDialog from "@/app/components/EditBookingDialog";
import { useRooms } from "@/app/hooks/useRooms";
import { useBookings } from "@/app/hooks/useBookings";
import { useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import type { Booking } from "@/app/types";

export default function Page() {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const dateISO = useMemo(() => date.format("YYYY-MM-DD"), [date]);

  const rooms = useRooms();
  const { bookings, loading, refetch } = useBookings(dateISO);

  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error";
  }>({
    open: false,
    msg: "",
    sev: "success",
  });

  // 編集ダイアログ
  const [editOpen, setEditOpen] = useState(false);
  const [target, setTarget] = useState<Booking | null>(null);

  // 削除中 ID
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("この予約を削除しますか？")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message ?? "削除に失敗しました");
      }
      setSnack({ open: true, msg: "削除しました", sev: "success" });
      refetch();
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e?.message ?? "削除に失敗しました",
        sev: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <HeaderBar date={date} onDateChange={setDate} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <ReservationsList
            bookings={bookings}
            loading={loading}
            onEdit={(b) => {
              setTarget(b);
              setEditOpen(true);
            }}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <NewBookingForm
            rooms={rooms}
            dateISO={dateISO}
            onCreated={() => {
              setSnack({
                open: true,
                msg: "予約を作成しました",
                sev: "success",
              });
              refetch();
            }}
          />
        </Grid>
      </Grid>

      <EditBookingDialog
        open={editOpen}
        target={target}
        rooms={rooms}
        dateISO={dateISO}
        onClose={() => setEditOpen(false)}
        onSaved={() => {
          setSnack({ open: true, msg: "更新しました", sev: "success" });
          refetch();
        }}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.sev} variant="filled" sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
