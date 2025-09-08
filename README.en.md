# Meeting Room Reservation System

A meeting room reservation management app built with Next.js, Prisma, PostgreSQL, and MUI.  
Users can select a date to book a meeting room, with conflict detection, editing, and deletion features available.

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: MUI v5
- **Backend**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Date Utility**: Day.js

---

## Features

- Display a list of meeting rooms
- Show reservations by date
- Create new reservations (with conflict detection)
- Edit and delete reservations (modal UI)
- Validation (end time must be after start time)
- Unified time handling in Asia/Tokyo timezone

---

## Getting Started

Clone the repository, install dependencies, run the database migration & seed, and start the development server.

```bash
# 1) Clone the repository
git clone https://github.com/yourname/reservation-manager.git
cd reservation-manager

# 2) Install dependencies
pnpm install

# 3) Run database migration & seed
pnpm prisma migrate dev --name init
pnpm seed

# 4) Start the development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Database Schema (Prisma)

```prisma
model User {
  id       Int       @id @default(autoincrement())
  name     String
  email    String    @unique
  bookings Booking[]
}

model Room {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  capacity  Int
  bookings  Booking[]
}

model Booking {
  id      Int      @id @default(autoincrement())
  userId  Int
  roomId  Int
  start   DateTime
  end     DateTime
  user    User     @relation(fields: [userId], references: [id])
  room    Room     @relation(fields: [roomId], references: [id])
}
```
