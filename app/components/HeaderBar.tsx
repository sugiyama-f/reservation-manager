"use client";

import { Stack, Typography } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import ja from "dayjs/locale/ja";

dayjs.locale(ja);

type Props = {
  date: Dayjs;
  onDateChange: (d: Dayjs) => void;
};

export default function HeaderBar({ date, onDateChange }: Props) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          会議室予約システム
        </Typography>
        <DatePicker
          label="日付"
          value={date}
          onChange={(d) => d && onDateChange(d.startOf("day"))}
          slotProps={{ textField: { size: "small" } }}
        />
      </Stack>
    </LocalizationProvider>
  );
}
