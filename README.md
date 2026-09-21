# GameShelf v2

A cross-device game-collection tracker. Backend stores your shelf in SQLite;
frontend is a React SPA. Designed to be reached from any device via a
Cloudflare quick tunnel — no port forwarding, no hosting account.

> v2 replaces the original [GameShelf](https://github.com/jasonjay86/GameShelf)
> LocalStorage-only design with a real backend so the same shelf appears on
> phone, laptop, and tablet.

---

## Stack

- **Backend:** Node.js + Express + SQLite (`sqlite3`)
- **Frontend:** React + Vite + Tailwind CSS
- **Tunnel:** [`cloudflared`](https://github.com/cloudflare/cloudflared) quick tunnel — no account required

---

## Schema

Single table for now (the v1 `DESIGN.md` lists more, but those came before the
working sync layer did — see "Roadmap" below).

```
games(
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT,
  platform    TEXT,
  status      TEXT,        -- Unplayed | Backlog | Playing | Completed | Dropped
  device_id   TEXT,        -- which browser last touched this row
  updated_at  TEXT         -- ISO-8601, drives last-write-wins
)
```

---

## API

| Method | Path              | Body                                                | Notes                              |
|--------|-------------------|-----------------------------------------------------|------------------------------------|
| GET    | `/api/games`      | —                                                   | All games, newest `updated_at` first |
| POST   | `/api/games`      | `{ title, platform, status, device_id? }`           | Returns `{ id, updated_at }`        |
| PUT    | `/api/games/:id`  | `{ title, platform, status, device_id? }`           | Last-write-wins                     |
| DELETE | `/api/games/:id`  | —                                                   |                                    |

CORS is wide open (`*`) — fine for a personal project, tighten before sharing.

---

## Running it

### One-time

```bash
npm install                    # backend deps (express, sqlite3, cors, body-parser)
cd frontend && npm install && cd ..
```

### Start the backend

```bash
node index.js
# → GameShelf running at http://localhost:3000
```

The SQLite database (`games.db`) is created and migrated automatically on first
run. Re-running migrations on an existing file is idempotent — old rows get
backfilled `updated_at` timestamps and `device_id` set to `NULL`.

### Expose it to other devices

In a second terminal:

```bash
cloudflared tunnel --url http://localhost:3000
```

Cloudflare prints a `https://*.trycloudflare.com` URL. Use that.

> Quick tunnels rotate URLs each time the process restarts. For a stable URL,
> set up a [named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/).

### Point the frontend at the tunnel

```bash
cd frontend
cp .env.example .env.production
# edit .env.production and set VITE_API_URL to the trycloudflare URL
npm run build
```

Serve the `dist/` directory however you like (GitHub Pages, Netlify, even
`python -m http.server` on the phone-side laptop if you just want to test).
For pure local development, skip the build and run `npm run dev` — empty
`VITE_API_URL` means the dev server proxies same-origin.

---

## Sync semantics

- **Last-write-wins**, judged by `updated_at`. No CRDTs, no vector clocks.
- **One user, multiple devices** — that's the design point. A browser's
  `device_id` is stored in `localStorage` and sent on every write so you can
  see which device last touched a row.
- **No conflict UI.** If you edit the same row on two devices while offline,
  whichever sync reaches the server last wins. For one human this is fine;
  multi-user would need real conflict handling.

---

## Roadmap (intentional, in priority order)

1. ✅ Sync across devices via Cloudflare tunnel.
2. **Conflict resolution** — at minimum, surface a "modified elsewhere"
   warning when an incoming write would clobber a newer `updated_at`.
3. **RAWG ingestion** — populate cover art, Metacritic score, genres from the
   RAWG API. Schema in `DESIGN.md` anticipates this but the backend table is
   minimal until #1 is bulletproof.
4. **Genres / collections / shelves** — junction tables from `DESIGN.md`.
5. **Move from cloudflared quick tunnel to a named tunnel** — stable URL,
   no rotation.

---

## Repository layout

```
.
├── DESIGN.md              # v1 schema + RAWG rationale (mostly superseded)
├── DESIGN_FRONTEND.md     # v1 frontend wireframes (still relevant)
├── index.js               # Express server
├── database.js            # SQLite connection + idempotent migrations
├── ingestion.py           # RAWG ingestor stub (Python; not yet wired in)
├── games.db               # SQLite database (gitignored)
├── package.json
├── tests/                 # Pytest for the ingestion stub
└── frontend/
    ├── .env.example
    ├── src/
    │   ├── App.jsx
    │   └── pages/CatalogPage.jsx
    └── package.json
```

---

## License

ISC — see `package.json`.
