# Tournament Organizer

A real-time tournament management platform for streamers and content creators. Supports live snake drafts, single-elimination brackets, and per-match setup with Socket.io.

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Styling**: Tailwind CSS (dark-mode-first)
- **Real-time**: Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **State**: Zustand (client-side)

## Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/tournament_db"
NEXTAUTH_SECRET="a-random-secret-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Run database migrations

```bash
npm run db:migrate
```

This applies the Prisma schema and creates all tables.

### 5. Start the dev server

```bash
npm run dev
```

The custom server starts on **http://localhost:3000** and Socket.io is served at `/api/socket`.

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/create` | Create a new tournament |
| `/join/[id]` | Join page for participants |
| `/tournament/[id]` | Main tournament page (host + viewer) |

## Flow

1. **Host** visits `/create`, fills in the form, and is redirected to `/tournament/[id]`. Their `hostToken` is stored in `localStorage`.
2. **Participants** open the shareable `/join/[id]` link, enter their name, and are redirected to the tournament page.
3. **Host** assigns captains per team in the **Participants** tab.
4. **Host** starts the draft from the **Draft** tab. Captains pick in snake order; all clients see picks in real-time.
5. After the draft completes (or if draft is disabled), the **Bracket** tab lets the host generate the single-elimination bracket.
6. In the **Schedule** tab the host clicks **Set up match** to randomly assign map / side / server, then **Record result** to advance the bracket.
7. When the final match is resolved, confetti rains and the champion is announced.

## Real-time Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join:room` | Client → Server | Subscribe to a tournament room |
| `participant:joined` | Server → Client | New participant joined |
| `draft:start` | Server → Client | Draft has started |
| `draft:pick` | Server → Client | A pick was made |
| `draft:pause` | Server → Client | Draft paused |
| `draft:resume` | Server → Client | Draft resumed |
| `bracket:update` | Server → Client | Bracket generated/updated |
| `match:setup` | Server → Client | Match map/side/server assigned |
| `match:result` | Server → Client | Winner recorded |

## Database Schema

See `prisma/schema.prisma` for the full schema. Key models:

- `Tournament` — the root entity
- `Team` — belongs to a tournament, has optional captain
- `Participant` — a joined player (can be Captain, Participant, or Host role)
- `Match` — bracket match with optional setup details
- `DraftPick` — one pick per slot in the snake draft

## Production

```bash
npm run build
npm start
```

Make sure `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` are set in your production environment.
