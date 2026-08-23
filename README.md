SIIMA é um monorepo (npm workspaces) com três camadas:

- `apps/web` — frontend Next.js.
- `apps/api` — backend NestJS (REST).
- `packages/database` — Prisma Client e migrations.
- `packages/shared` — schemas Zod e tipos compartilhados entre `web` e `api`.

## Getting Started

Instale as dependências uma vez na raiz (o npm resolve todos os workspaces):

```bash
npm install
```

Depois, rode cada app no seu próprio workspace:

```bash
npm run dev --workspace=@siima/web    # http://localhost:3000
npm run start:dev --workspace=@siima/api  # http://localhost:3001
```

O frontend consome a API via `NEXT_PUBLIC_API_URL` (ver `.env.example`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
