# English Teaching Platform

A web application for English teachers to manage student registrations and assignment submissions for three teaching methods: PPF, Beyond, and Contrast.

## Features

- Google OAuth authentication
- Assignment submission
- Support for PPF, Beyond, and Contrast methods

## Getting Started

1. Set up Google OAuth:
   - Create a Google Cloud project and enable Google+ API.
   - Create OAuth 2.0 credentials and add the client ID and secret to `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma migrate dev
```

4. Run the development server:

```bash
npm run dev
```

## Deployment Notes

- `npm run build` now runs `prisma migrate deploy` automatically before building.
- If your deploy provider uses a pooled `DATABASE_URL`, set `DIRECT_URL` to the direct Postgres connection string so migrations can run successfully.
- If migration cannot run during build, the build will continue and the app will stay in fallback mode for features that need newer schema.
- If you need to skip this step (for example, preview builds without DB access), set `SKIP_PRISMA_MIGRATE=1`.

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Technologies

- Next.js
- Prisma
- NextAuth.js
- Tailwind CSS
