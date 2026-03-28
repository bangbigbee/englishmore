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

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Technologies

- Next.js
- Prisma
- NextAuth.js
- Tailwind CSS
