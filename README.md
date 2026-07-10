This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Auth & data

Sign up at `/auth/register` (email, username, password). Passwords are hashed with **bcrypt** and stored with **SQLite** (`data/blog.db`; the `users` table is created on first DB access).

**Blog posts:** each row in `posts` has optional **`user_id`** pointing at **`users.id`**. **`author`** is kept in sync with **`users.username`** when you publish from your account (`insertPost`). Seeded demo posts attach to built-in demo authors (same password for all):

- Usernames such as **`maya_chen`**, **`alex_kim`**, etc. (see `src/lib/user-seed.ts`).
- Shared dev password **`SeedBlogAuthors!demo1`** (see `SHARED_SEED_PASSWORD` in `user-seed.ts`).

Edit/delete/show actions on post detail pages are restricted to that owner. Orphan legacy rows migrate under **`legacy_import`** if names cannot be matched (`src/lib/db.ts`).

Sign in uses [NextAuth.js](https://next-auth.js.org/) v4 with the **Credentials** provider at `/auth/signin`. Copy `.env.example` to `.env.local` and set **`NEXTAUTH_SECRET`** and **`NEXTAUTH_URL`** (see [NextAuth.js configuration](https://next-auth.js.org/configuration/options)).

**Sessions:** short-lived JWT session cookies are renewed from an **httpOnly refresh token**. Refresh rows live in **`refresh_tokens`** (`data/blog.db`; hashed opaque values only). Signing out clears the refresh cookie and revokes tokens for that user.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
