This is a [Next.js](https://nextjs.org) project for the **Internship Management Portal**.

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

## Viewing Authentication Pages Locally

This repo runs a separate Express-based auth server for the demo. To view the `/register` and `/login` pages and have them talk to the backend:

1. Start the auth server:

```bash
cd server
# install dependencies if needed
npm install express cookie-parser
node server.js
```

2. In a separate terminal, start the Next.js client:

```bash
cd client
npm install
npm run dev
```

3. Open the pages:

- Register: http://localhost:3000/register
- Login: http://localhost:3000/login

Notes:
- The client is configured to send requests to `http://localhost:4000` during local development.
- The server stores users in `server/data/users.json` (prototype). Replace with a DB for production.
