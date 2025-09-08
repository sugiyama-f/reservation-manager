"use client";

import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ja from "dayjs/locale/ja";
import { useSession, signIn, signOut } from "next-auth/react";

dayjs.locale(ja);

type Props = {
  date: Dayjs;
  onDateChange: (d: Dayjs) => void;
};

export default function HeaderBar({ date, onDateChange }: Props) {
  const { data: session, status } = useSession();

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2 }}>
      <Toolbar sx={{ gap: 2, justifyContent: "space-between" }}>
        <Typography variant="h5" fontWeight={700}>
          会議室予約システム
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
          <DatePicker
            label="日付"
            value={date}
            onChange={(d) => d && onDateChange(d.startOf("day"))}
            slotProps={{ textField: { size: "small" } }}
          />
        </LocalizationProvider>
        <Stack direction="row" spacing={1} alignItems="center">
          {status === "authenticated" ? (
            <>
              <Typography variant="body2">
                Hello, {session?.user?.name ?? session?.user?.email}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => signIn(undefined, { callbackUrl: "/" })}
            >
              Sign in
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
