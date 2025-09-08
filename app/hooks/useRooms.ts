"use client";
import { useEffect, useState } from "react";
import type { Room } from "../types";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then(setRooms);
  }, []);
  return rooms;
}
