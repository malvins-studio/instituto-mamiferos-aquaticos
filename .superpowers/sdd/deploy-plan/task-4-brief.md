# Task 4: Push para GitHub e Conectar ao Vercel

## Objetivo
Fazer push das mudanças (Tasks 1-3) para GitHub na branch `main` e conectar projeto ao Vercel para começar deployments automáticos.

## Contexto
- Repository GitHub já existe: `https://github.com/malvins-studio/instituto-mamiferos-aquaticos.git`
- Branch atual: `develop`
- Alvo: merge em `main` e conectar ao Vercel

## Global Constraints
- Merge deve ser clean (sem conflitos)
- Todos os commits das Tasks 1-3 devem estar em `main`
- Vercel será conectado via GitHub OAuth

## Passos Executáveis

### Passo 1: Verificar status antes de push

```bash
git status
git log --oneline -5
```

Esperado: Working tree clean, commits de Task 1 e 3 visíveis

### Passo 2: Push para GitHub

```bash
git push origin develop
```

Esperado: Push successful, branch develop atualizada

### Passo 3: Criar Pull Request (via GitHub CLI)

```bash
gh pr create --base main --head develop \
  --title "chore: configure deployment for Vercel" \
  --body "Prepares application for Vercel deployment:
- Add .env.example with environment variables
- Configure vercel.json for Next.js framework
- Add prebuild script for Prisma migrations

Closes #<issue_number>" || echo "Crie PR manualmente em GitHub"
```

Se `gh pr create` falhar, criar manualmente em:
`https://github.com/malvins-studio/instituto-mamiferos-aquaticos/compare/main...develop`

### Passo 4: Merge PR para main

Via GitHub CLI:
```bash
gh pr merge --squash
# ou --merge, conforme sua estratégia
```

Ou manualmente:
1. Acesse PR em GitHub
2. Clique "Squash and merge" ou "Merge pull request"
3. Confirme

### Passo 5: Atualizar local main branch

```bash
git checkout main
git pull origin main
```

### Passo 6: Conectar ao Vercel (Manual via Web UI)

1. Acesse https://vercel.com
2. Clique "Add New..." → "Project"
3. Selecione `instituto-mamiferos-aquaticos` (GitHub)
4. Clique "Import"
5. Vercel detectará `next.config.ts` automaticamente
6. Clique "Deploy"

**Nota:** Não configurar variáveis de ambiente ainda (Task 5)

## Critérios de Sucesso
- ✓ `git push origin develop` bem-sucedido
- ✓ PR criado e mergeado para `main`
- ✓ `main` branch atualizado localmente
- ✓ Vercel projeto criado (visível em dashboard)
- ✓ Primeiro deploy iniciado (ainda falhará sem DATABASE_URL)
