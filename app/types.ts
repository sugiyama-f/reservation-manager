export type Room = { id: number; name: string; capacity: number };
export type Booking = {
  id: number;
  start: string;
  end: string;
  room: Room;
  user: { name: string; email: string };
};
