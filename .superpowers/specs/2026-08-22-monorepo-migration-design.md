# Spec: Migração para Monorepo Modular (DDD)

## 1. Contexto e Objetivo

O **SIIMA** atualmente é um monólito **Next.js** com **Server Actions** e **Prisma** integrados na raiz (`src/`).

O objetivo desta Spec é realizar uma **grande refatoração estrutural**, **sem alterar nenhuma regra de negócio**, transformando o projeto em um **Monorepo** utilizando **npm Workspaces**.

Essa mudança irá:

- Isolar **Frontend**, **Backend** e **Pacotes Compartilhados**.
- Seguir os princípios de **Domain-Driven Design (DDD)**.
- Facilitar escalabilidade, testes, manutenção e reutilização de código.

---

## 2. Arquitetura Alvo (O Mapa)

A estrutura final do projeto deve ser **exatamente** a seguinte:

```text
siima-workspace/
├── package.json                 # Configurado com npm workspaces (incluindo devDependencies como Jest)
├── .env
│
├── packages/
│   ├── database/
│   │   ├── package.json         # name: @siima/database
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   ├── migrations/
│   │   │   └── ...
│   │   ├── prisma.config.ts
│   │   └── src/
│   │       └── index.ts
│   │
│   └── shared/
│       ├── package.json         # name: @siima/shared
│       └── src/
│           ├── index.ts
│           └── schemas/
│               └── occurrenceSchema.ts
│
└── apps/
    ├── api/
    │   ├── package.json         # depende explicitamente de @siima/database e @siima/shared
    │   └── src/
    │       ├── modules/
    │       │   └── occurrences/
    │       │       ├── occurrence.module.ts
    │       │       ├── occurrence.controller.ts
    │       │       ├── occurrence.service.ts
    │       │       ├── occurrence.service.test.ts
    │       │       └── occurrence.repository.ts
    │       ├── app.module.ts
    │       └── main.ts
    │
    └── web/
        ├── package.json         # depende explicitamente de @siima/shared
        ├── next.config.ts
        ├── postcss.config.mjs
        └── src/
            ├── app/
            │   ├── (public)/    # Rotas de acesso livre (ex: login, landing)
            │   └── (private)/   # Rotas protegidas (ex: dashboard de ocorrências)
            ├── components/
            ├── hooks/
            ├── lib/
            ├── services/        # Cliente HTTP (fetch/axios) apontando para a API
            └── public/
```

### Responsabilidade de cada camada

| Camada              | Responsabilidade                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------- |
| `packages/database` | Prisma Client, Schema e Migrations. Nenhum componente React importa Prisma diretamente.                        |
| `packages/shared`   | Schemas Zod, tipos compartilhados e contratos entre frontend e backend.                                        |
| `apps/api`          | Backend **NestJS** responsável pelas regras de aplicação, endpoints REST e acesso exclusivo ao banco de dados. |
| `apps/web`          | Aplicação Next.js contendo **somente interface**, estado e chamadas HTTP para a API.                           |

---

## 3. Ordem de Execução (Checklist do Agente)

> **IMPORTANTE:** Execute **estritamente nesta ordem** e realize **um commit ao final de cada etapa concluída com sucesso**.

### Passo 1 — Chassi do Monorepo

- [ ] Atualizar o `package.json` da raiz.
- [ ] Configurar os workspaces:

```json
{
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

- [ ] Criar as pastas base: `apps/` e `packages/`.

**Commit sugerido**

```bash
git commit -m "chore(monorepo): initialize npm workspaces structure"
```

---

### Passo 2 — Extração dos Pacotes Compartilhados

#### Criar `@siima/shared`

- [ ] Mover todos os schemas Zod para cá.
- [ ] Criar `src/index.ts` exportando todos os schemas.

#### Criar `@siima/database`

- [ ] Mover a pasta `prisma/` e `prisma.config.ts`.
- [ ] Criar `src/index.ts` exportando a instância única do Prisma Client.

**Commit sugerido**

```bash
git commit -m "refactor(packages): extract shared schemas and prisma package"
```

---

### Passo 3 — O Fio Condutor (Conectando os Pacotes)

- [ ] Vá ao arquivo `apps/api/package.json` e adicione no bloco `dependencies: "@siima/shared": "*"` e `"@siima/database": "*"`

- [ ] Vá ao arquivo `apps/web/package.json` e adicione no bloco `dependencies: "@siima/shared": "*"`

- [ ] Execute `npm install` na raiz do projeto para o npm mapear os links locais.

---

### Passo 4 — Criação da API (Backend NestJS / DDD)

- [ ] Inicializar `apps/api` com a estrutura base do NestJS.
- [ ] Migrar toda a lógica de `src/lib/actions/occurrence.ts` para a API.
- [ ] Converter Server Actions em endpoints REST no `occurrence.controller.ts`.
- [ ] **Separação DDD Obrigatória:**
  - **Controller:** Lida apenas com a rota HTTP (ex: `@Get()`, `@Post()`).
  - **Service:** Regras de negócio da aplicação.
  - **Repository:** Acesso exclusivo ao banco usando o pacote `@siima/database`.

- [ ] Adicionar o módulo no Registro Central (app.module.ts).
- [ ] **Commit sugerido:** `feat(api): migrate occurrence server actions into NestJS REST API`

---

### Passo 5 — A Prova de Fogo (Testes Automatizados)

- [ ] Garantir que o `jest` e o `ts-node` estejam configurados nas `devDependencies`.
- [ ] Criar o arquivo `occurrence.service.test.ts` e escrever testes unitários cobrindo as regras de negócio principais (ex: criação e listagem).
- [ ] Rodar os testes para validar se a migração da lógica não quebrou o sistema.
- [ ] **Commit sugerido:** `test(api): implement unit tests for occurrence business rules`

---

### Passo 6 — Isolamento do Frontend (Rotas e UI)

- [ ] Mover a aplicação Next.js para `apps/web`.
- [ ] Reestruturar a pasta `app/` utilizando Grupos de Rotas do Next.js:
  - Mover as páginas abertas para `src/app/(public)/`.
  - Mover o painel de uso do SIIMA para `src/app/(private)/`.

- [ ] Remover do frontend: Prisma Client, Server Actions e qualquer import direto do banco. O Frontend passa a depender exclusivamente de chamadas HTTP.
- [ ] Criar o cliente HTTP (`apps/web/src/services/api.ts`) substituindo os formulários que usavam Server Actions por `fetch/axios`.
- [ ] **Commit sugerido:** `refactor(web): isolate frontend, apply route groups and implement REST client`

---

### Passo 7 — Limpeza Final

**Atenção:** Execute isso somente quando `apps/web` e `apps/api` compilarem corretamente.

- [ ] Remover da raiz: a pasta `src/` antiga e códigos legados de Server Actions.
- [ ] Executar build final para validar a integridade estrutural.
- [ ] **Commit sugerido:** `chore: remove legacy monolith structure after migration`

---

# 4. Regras e Travas de Segurança (MANDATÓRIO)

## Zero Perda de Dados

- ❌ Não excluir `packages/database/prisma/migrations`.
- ❌ Não recriar migrations.
- ✅ Preservar histórico completo e intacto do Prisma.

---

## Design Visual Intacto

O frontend deve permanecer **100% igual** visualmente.

Isso inclui:

- React.
- Tailwind CSS.
- ShadCN UI.
- Layout.
- Componentes.
- Fluxo de navegação.

A migração é **estrutural**, não visual.

---

## Fonte Única da Verdade (Schemas)

O Schema Zod deve existir **uma única vez**.

**Local obrigatório**

```text
packages/shared/src/schemas/occurrenceSchema.ts
```

Esse schema deve ser consumido por:

- `apps/web` (validação de formulários).
- `apps/api` (validação das requisições REST).

É expressamente proibido duplicar arquivos de validação.

---

## Prisma Isolado

Somente `@siima/database` pode importar:

```ts
import { PrismaClient } from "@prisma/client";
```

Nenhum outro workspace deve acessar Prisma diretamente.

---

## Backend como Único Dono da Regra de Negócio

Toda persistência e regras de aplicação ficam em `apps/api`.

O frontend apenas:

1. Coleta dados.
2. Valida com Zod.
3. Envia requisições HTTP.
4. Renderiza os resultados.

---

# Resultado Esperado

Ao final da migração, o SIIMA deverá possuir:

```text
| Área | Estado Esperado |
|------|-----------------|
| Monorepo | npm Workspaces configurado. |
| Frontend | Next.js isolado em `apps/web`. |
| Backend | API REST modular em `apps/api` seguindo DDD. |
| Banco | Prisma isolado em `packages/database`. |
| Tipos e validação | Zod compartilhado em `packages/shared`. |
| Comunicação | Frontend → HTTP → API → Prisma. |
| UI | Sem qualquer alteração visual ou funcional percebida pelo usuário. |
```

---

## Fluxo Final da Aplicação

```text
                apps/web (Next.js)
                       │
             fetch / axios (HTTP REST)
                       │
                       ▼
                apps/api (DDD)
        Controller → Service → Repository
                       │
                       ▼
        packages/database (Prisma Client)
                       │
                       ▼
                 PostgreSQL (Neon)

        ▲
        │
packages/shared (Schemas Zod + Types)
Compartilhado entre Web e API
```
