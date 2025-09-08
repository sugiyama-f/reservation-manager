# 会議室予約システム

Next.js + Prisma + PostgreSQL + MUI を用いて構築した会議室予約管理アプリです。  
日付を指定して会議室を予約でき、重複チェック・編集・削除が可能です。

---

## 使用技術

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **UI**: MUI v5
- **Backend**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Date Utility**: Day.js

---

## 主な機能

- 会議室の一覧表示
- 日付ごとの予約表示
- 予約の新規作成（重複チェックあり）
- 予約の編集・削除（モーダル UI）
- バリデーション（終了時刻は開始時刻より後である必要あり）
- Asia/Tokyo タイムゾーンに統一した時間管理

---

## セットアップ方法

### 依存インストール

pnpm install

### DB マイグレーション & シード

pnpm prisma migrate dev --name init
pnpm seed

### 開発サーバー起動

pnpm dev

---

## DB スキーマ（Prisma）

```prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  bookings Booking[]
}

model Room {
  id    Int    @id @default(autoincrement())
  name  String @unique
  capacity Int
  bookings Booking[]
}

model Booking {
  id     Int      @id @default(autoincrement())
  userId Int
  roomId Int
  start  DateTime
  end    DateTime
  user   User     @relation(fields: [userId], references: [id])
  room   Room     @relation(fields: [roomId], references: [id])
}
```
