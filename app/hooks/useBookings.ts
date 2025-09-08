"use client";
import { useCallback, useEffect, useState } from "react";
import type { Booking } from "../types";

export function useBookings(isoDate: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(() => {
    setLoading(true);
    fetch(`/api/bookings?date=${isoDate}`)
      .then((r) => r.json())
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [isoDate]);

  useEffect(refetch, [refetch]);

  return { bookings, loading, refetch };
}
