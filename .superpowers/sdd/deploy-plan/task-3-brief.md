# Task 3: Preparar Repositório para Deploy

## Objetivo
Preparar e validar configurações do Next.js para Vercel deployment, garantindo que Prisma migrations rodão automaticamente no build.

## Global Constraints
- `package.json` deve ter `prebuild` script que roda `prisma db push --skip-generate`
- `npm run build` deve executar sem erros
- Vercel será o alvo de deployment
- Node.js 18+ (Vercel padrão)

## Passos Executáveis

### Passo 1: Testar build localmente

```bash
npm run build
```

Esperado: Sucesso sem erros, deve compilar Next.js e gerar `.next/`

### Passo 2: Criar `vercel.json` (configuração otimizada)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@DATABASE_URL"
  }
}
```

Salvar exatamente em `/vercel.json`

### Passo 3: Modificar `package.json` para auto-migrate

Adicione o script `prebuild` (executa antes do `next build`):

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "prebuild": "prisma db push --skip-generate",
    "build": "next build",
    "start": "next start",
    "dev": "next dev",
    "lint": "eslint"
  }
}
```

**Nota:** O `--skip-generate` evita gerar Prisma client duas vezes (já feito no postinstall).

### Passo 4: Validar que prebuild funciona

```bash
rm -rf .next node_modules/.prisma/client
npm run build
```

Esperado: 
```
> prisma db push --skip-generate
✓ Database synced (ou "No changes needed")
> next build
✓ Compiled successfully
```

### Passo 5: Commit

```bash
git add vercel.json package.json
git commit -m "chore: configure Vercel deployment and Prisma auto-migration"
```

## Critérios de Sucesso
- ✓ `npm run build` executa sem erros
- ✓ `vercel.json` criado com configuração Next.js
- ✓ `package.json` tem `prebuild` script
- ✓ Prisma migrations rodão automaticamente no build
- ✓ Commit realizado
- ✓ Nenhuma credencial exposta em `vercel.json`
