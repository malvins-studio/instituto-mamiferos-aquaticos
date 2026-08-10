# Task 5: Configurar Variáveis de Ambiente no Vercel

## Objetivo
Adicionar `DATABASE_URL` e `DIRECT_URL` ao Vercel como secrets criptografados, habilitando o aplicativo a conectar com Supabase em produção.

## Contexto
- Projeto Vercel já foi criado em Task 4
- DATABASE_URL e DIRECT_URL foram obtidos do Supabase
- Vercel é o host de produção

## Global Constraints
- Variáveis sensíveis devem ser configuradas via Vercel UI (não no código)
- Ambas DATABASE_URL e DIRECT_URL são necessárias
- Deve estar disponível em todos os ambientes: Production, Preview, Development

## Passos Executáveis

### Passo 1: Obter variáveis do Supabase

Se não as tiver:
1. Acesse Supabase dashboard
2. Projeto: `instituto-mamiferos-aquaticos`
3. Vá para **Settings → Database → Connection string**
4. Copie as URLs:
   - **DATABASE_URL:** `postgresql://user:password@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?schema=public`
   - **DIRECT_URL:** `postgresql://user:password@aws-0-sa-east-1.pooler.supabase.com:5432/postgres?schema=public`

### Passo 2: Acessar Vercel Project Settings

1. Vá para https://vercel.com/dashboard
2. Selecione projeto `instituto-mamiferos-aquaticos`
3. Vá para **Settings** → **Environment Variables**

### Passo 3: Adicionar DATABASE_URL

1. Clique "+ Add New"
2. **Name:** `DATABASE_URL`
3. **Value:** (cole a URL do Supabase Transaction pooler - porta 6543)
4. **Environments:** Selecione:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Clique "Save"

### Passo 4: Adicionar DIRECT_URL

1. Clique "+ Add New"
2. **Name:** `DIRECT_URL`
3. **Value:** (cole a URL do Supabase Direct pooler - porta 5432)
4. **Environments:** Selecione:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Clique "Save"

### Passo 5: Verificar na UI

Deve aparecer ambas as variáveis listadas em Environment Variables:
```
DATABASE_URL .............. (Production, Preview, Development)
DIRECT_URL ................ (Production, Preview, Development)
```

### Passo 6: Documentar (via report)

Capture screenshot ou anote:
- ✅ DATABASE_URL configurada
- ✅ DIRECT_URL configurada
- ✅ Ambas em Production, Preview, Development

## Critérios de Sucesso
- ✓ DATABASE_URL adicionada ao Vercel (criptografada)
- ✓ DIRECT_URL adicionada ao Vercel (criptografada)
- ✓ Ambas variáveis em todos os 3 ambientes
- ✓ Nenhuma credencial exposta em código
- ✓ Documentação via relatório

## Notas
- Vercel não exibe o valor completo na UI (apenas prefixo)
- Mudanças são imediatas (não precisa redeploy)
- Próximo deploy usará as variáveis automaticamente
