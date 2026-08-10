# Task 1: Preparar Arquivo de Configuração de Ambiente

## Objetivo
Criar arquivo `.env.example` versionado com variáveis de ambiente necessárias e garantir que `.env` nunca é commitado.

## Global Constraints
- Variáveis de ambiente sensíveis não devem ser commitadas
- `.env.example` deve ser versionado (para documentar as variáveis necessárias)
- DATABASE_URL está sendo usada com Supabase PostgreSQL

## Passos Executáveis

### Passo 1: Criar `.env.example` com variáveis necessárias

```bash
cat > .env.example << 'EOF'
# Banco de dados (substitua com sua URL)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Opcional: Para desenvolvimento local
NODE_ENV="development"
EOF
```

### Passo 2: Verificar se `.env` está no `.gitignore`

```bash
grep -q "\.env" .gitignore && echo "✓ .env ignorado" || echo "✗ Adicionar .env ao .gitignore"
```

Se não estiver listado, adicione as seguintes linhas ao `.gitignore`:
```
.env
.env.local
.env.*.local
```

### Passo 3: Fazer commit

```bash
git add .env.example .gitignore
git commit -m "chore: add environment configuration template"
```

## Critérios de Sucesso
- ✓ `.env.example` criado com DATABASE_URL e NODE_ENV
- ✓ `.env` está no `.gitignore` (nunca será commitado)
- ✓ Commit realizado com mensagem apropriada
- ✓ Nenhum arquivo `.env` real foi commitado acidentalmente
