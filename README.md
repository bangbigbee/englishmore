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

2. (Optional) Set up Azure Speech for vocabulary pronunciation:
   - Create an Azure Speech resource.
   - Add these values to `.env`:
     - `AZURE_SPEECH_KEY=your_speech_key`
     - `AZURE_SPEECH_REGION=your_speech_region` (for example: `eastus`)
     - `AZURE_SPEECH_VOICE=en-US-JennyNeural` (optional, defaults to this voice)

3. Install dependencies:

```bash
npm install
```

4. Set up the database:

```bash
npx prisma migrate dev
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Technologies

- Next.js
- Prisma
- NextAuth.js
- Tailwind CSS
