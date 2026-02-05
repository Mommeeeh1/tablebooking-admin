# Booking Platform – Admin Portal & API

Next.js-app som innehåller **backend (REST-API)** och **admin-webbgränssnitt** för bordbokningsplattformen. Databas: PostgreSQL (Prisma).

---

## Övergripande arkitektur

Detta repo är både API och admin-UI:

- **API** (`app/api/*`): REST-endpoints för mobilappen (auth, bokningar, notiser). Tunna route-handlers som anropar tjänstelager.
- **Tjänstelager** (`lib/services/*`): Affärslogik (BookingService, UserService, NotificationService). Får repositorier via constructor injection.
- **Repositorier** (`lib/repositories/*`): Dataåtkomst mot PostgreSQL via Prisma. Implementerar interfaces från `lib/interfaces/`.
- **Admin-UI**: `app/admin/login` och `app/admin/dashboard` – inloggning och hantering av alla bokningar (godkänn/neka).

Layered architecture: Routes → Services → Repositories → Prisma → PostgreSQL.

---

## Hur app och admin kommunicerar

- **Mobilappen** anropar detta API under `/api/*` (t.ex. `https://tablebooking-admin.vercel.app/api` eller `http://localhost:3000/api`).
- Autentisering med **JWT**. Klienten skickar `Authorization: Bearer <token>`.
- CORS är aktiverat så att mobilappen kan anropa från annan origin.

API-endpoints (urval): `POST /api/auth/register`, `POST /api/auth/login`, `GET/POST /api/bookings`, `DELETE /api/bookings/[id]`, `GET /api/bookings/[id]/can-cancel`, `GET /api/notifications`, `PATCH /api/notifications/[id]/read`, `POST /api/auth/admin/login`, `GET /api/admin/bookings`, `PATCH /api/admin/bookings/[id]/approve`, `PATCH /api/admin/bookings/[id]/reject`.

---

## Datamodell och viktiga relationer

- **User**: id, email, password (hashat), createdAt, updatedAt. Relationer: bookings, notifications.
- **Booking**: id, userId, date, time, numberOfPeople, status (PENDING | APPROVED | REJECTED | CANCELLED), createdAt, updatedAt. Tillhör en User.
- **Notification**: id, userId, bookingId (valfri), type (BOOKING_APPROVED | BOOKING_REJECTED), message, read, createdAt. Tillhör User och kan kopplas till Booking.


---

## Hur notiser fungerar

Systemet använder **in-app-notiser** (lagrade i databasen). När admin godkänner eller nekar en bokning skapar backend en **Notification**-rad (typ, meddelande, userId, bookingId). Mobilappen hämtar notiser via `GET /api/notifications` och visar dem i appen. Ingen push-tjänst.

---

## Motivering för val av in-app-notiser (ej push)

In-app-notiser valdes för enkelhets skull: ingen Expo Push/APNs/FCM, ingen enhetskonfiguration, och kraven om feedback till användaren uppfylls när notiserna visas i mobilappens Notifications-flik.

---

## Motivering för val av databas (PostgreSQL)

PostgreSQL används (t.ex. Neon) med Prisma. Skäl: tydliga relationer mellan User, Booking och Notification; bra stöd för migrationer och FK; fungerar i serverless (Vercel);  Bra molnstöd (Neon, Supabase).

---

## Setup

1. `npm install`
2. Skapa `.env` och sätt `DATABASE_URL` (PostgreSQL-URL, t.ex. från Neon) och `JWT_SECRET`.
3. `npx prisma generate` och `npx prisma migrate deploy`
4. `npm run dev` → öppna `http://localhost:3000`

Vid lokalt körning av hela plattformen: starta admin (detta repo) först, sedan mobilappen med `EXPO_PUBLIC_API_URL=http://localhost:3000/api`.

**Admin-inloggning:** `admin@booking.com` / `admin123`

## Deployment (Vercel)

Pusha till GitHub och importera projektet i Vercel. Sätt miljövariablerna `DATABASE_URL`, `JWT_SECRET` och `NEXT_PUBLIC_API_URL` (din Vercel-URL). Build-kommandot kör `prisma generate`, `prisma migrate deploy` och `next build`.

**Deployad admin-portal (för examinatorn):** Öppna https://tablebooking-admin.vercel.app/admin/login → logga in med `admin@booking.com` / `admin123` → du kommer till dashboard med alla bokningar (godkänn/neka).
