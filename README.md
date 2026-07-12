# My Blog

A self-hosted blog built with **Next.js 16** (App Router), **React 19**, **SQLite**, and **NextAuth.js v4**. Read posts on the public blog, register an account, sign in, and create or edit your own posts.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Database | SQLite via `better-sqlite3` (`data/blog.db`) |
| Auth | NextAuth Credentials + JWT sessions + httpOnly refresh tokens |
| Deploy | Docker standalone (`output: "standalone"` in `next.config.ts`) |

## Run with Docker (recommended)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

1. Copy the env template and set a secret:

   ```bash
   cp .env.example .env
   ```

   Generate `NEXTAUTH_SECRET` (PowerShell):

   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
   ```

   Or with OpenSSL:

   ```bash
   openssl rand -base64 32
   ```

   Your `.env` should include:

   ```env
   NEXTAUTH_SECRET=<generated-secret>
   NEXTAUTH_URL=http://localhost:3000
   ```

2. Build and start:

   ```bash
   docker compose up --build
   ```

3. Open [http://localhost:3000](http://localhost:3000).

**Useful commands:**

| Command | Purpose |
|---------|---------|
| `docker compose up --build -d` | Run in the background |
| `docker compose logs -f web` | Follow container logs |
| `docker compose down` | Stop containers |
| `docker compose down -v` | Stop and **delete** the database volume (fresh DB) |

SQLite data is stored in the Docker volume `blog-data`, mounted at `/app/data` inside the container.

## Run locally

```bash
npm install
cp .env.example .env.local   # or .env — set NEXTAUTH_SECRET and NEXTAUTH_URL
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database file is created at `data/blog.db` on first access.

Production build without Docker:

```bash
npm run build
npm start
```

## Demo sign-in

On first start, the database is seeded with demo authors (see `src/lib/user-seed.ts`). Sign in at `/auth/signin` with **email** and password — not username.

| Email | Password |
|-------|----------|
| `maya_chen@blog.seed` | `SeedBlogAuthors!demo1` |
| `jordan_lee@blog.seed` | same |
| `sam_rivera@blog.seed` | same |
| `alex_kim@blog.seed` | same |
| `riley_park@blog.seed` | same |

After sign-in you can create posts from `/blog` (**New post**). Edit and delete are limited to the post owner.

To create your own account, use **Register** at `/auth/register` (email, username, password).

## Auth & data

- Passwords are hashed with **bcrypt** and stored in SQLite (`users` table).
- Each post has optional `user_id` → `users.id`; `author` matches `users.username` when you publish from your account.
- **NextAuth** Credentials provider at `/auth/signin`; configure via `NEXTAUTH_SECRET` and `NEXTAUTH_URL` ([NextAuth options](https://next-auth.js.org/configuration/options)).
- Short-lived JWT session cookies are renewed from an **httpOnly refresh token** stored in `refresh_tokens` (hashed). Sign-out revokes refresh tokens for that user.

## Project layout

```
src/app/          # App Router pages, layouts, API routes
src/components/   # UI (mostly client islands)
src/lib/          # DB, auth, schemas (server-side)
data/             # SQLite (local dev; Docker uses a named volume)
public/           # Static assets (optional; OG images are generated in app/)
```

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)

Local learning notes (not in git by default): `docs/nextjs-topics-guide.md` and `docs/nextjs-topics-analysis.md`.
