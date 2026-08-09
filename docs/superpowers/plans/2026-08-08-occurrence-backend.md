# Backend de Persistência de Ocorrências (SIIMA) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persistir os dados do formulário de ocorrência (`occurrence-form.tsx`) em Postgres via Prisma, através de uma Server Action validada, sem autenticação/multi-tenancy/upload real de arquivo nesta rodada.

**Architecture:** Uma única tabela `Occurrence` no Postgres (local, via Docker), espelhando 1:1 o `formSchema` do Zod, com enums nativos para os campos de opção fechada. Uma Server Action (`createOccurrence`) revalida o payload no servidor, mapeia os valores do Zod para o formato do Prisma e persiste. O `onSubmit` do formulário chama essa Server Action em vez de só logar no console.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Prisma ORM, PostgreSQL 16 (Docker local), Zod, React Hook Form, `tsx` (para scripts de verificação, já que o projeto não tem Jest/Vitest configurado).

## Global Constraints

- Sem Clerk/autenticação nesta rodada — nenhuma tabela `User`, nenhuma sessão.
- Single-tenant — sem `Organization`/`organizationId`.
- `nomeFoto` continua `String` simples — sem upload real de arquivo.
- Postgres **local via Docker** nesta rodada (não Neon) — trocar depois é só mudar `DATABASE_URL`.
- Uma única tabela `Occurrence`, não normalizada por seção.
- Enums nativos do Postgres/Prisma para todo campo de opção fechada do Zod.
- A Server Action normaliza a inconsistência `Sim/Nao` (interacaoPesca) vs `sim/nao` (presencaTumores) do Zod para um único enum `SimNao`.
- A Server Action valida numericamente `latitude`/`longitude` antes de converter para `Float`, retornando erro de campo (não lança exceção não tratada) se não for numérico.
- Não há suíte de testes automatizados no projeto — a verificação de cada task usa scripts `tsx` ad-hoc (com `node:assert/strict`) em vez de Jest/Vitest.
- Fonte da verdade dos campos: `src/lib/schemas/occurrenceSchema.ts` (não alterar este arquivo neste plano).

---

## File Structure

- `docker-compose.yml` (novo) — Postgres local para dev.
- `.env.example` (novo) — template de `DATABASE_URL`, versionado.
- `.env` (novo, gitignored) — `DATABASE_URL` real, usado localmente.
- `prisma/schema.prisma` (novo) — datasource, generator, enums, model `Occurrence`.
- `prisma/migrations/**` (gerado pelo `prisma migrate dev`).
- `src/lib/prisma.ts` (novo) — singleton do `PrismaClient`.
- `src/lib/actions/occurrence-mappers.ts` (novo) — conversão `OccurrenceFormValues` → `Prisma.OccurrenceCreateInput`, incluindo `OccurrenceMappingError`.
- `src/lib/actions/occurrence.ts` (novo) — Server Action `createOccurrence` e o tipo `CreateOccurrenceResult`.
- `src/components/forms/occurrence-form.tsx` (modificado) — `onSubmit` passa a chamar `createOccurrence`.
- `scripts/verify-mappers.ts` (novo) — script de verificação manual dos mapeadores.
- `scripts/verify-occurrence-action.ts` (novo) — script de verificação manual da Server Action.
- `package.json` (modificado) — novas dependências e scripts (`db:up`, `db:down`, `db:studio`, `postinstall`).

---

### Task 1: Ambiente de banco de dados local (Docker) + dependências

**Files:**
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.env` (não versionado — já coberto por `.env*` no `.gitignore`)
- Modify: `package.json`

**Interfaces:**
- Consumes: nada (task inicial).
- Produces: Postgres acessível em `postgresql://siima:siima_dev_password@localhost:5432/siima?schema=public`, disponível para as tasks seguintes via a variável de ambiente `DATABASE_URL`. Dependências `prisma`, `@prisma/client`, `tsx` instaladas.

- [ ] **Step 1: Criar o `docker-compose.yml`**

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: siima_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: siima
      POSTGRES_PASSWORD: siima_dev_password
      POSTGRES_DB: siima
    ports:
      - "5432:5432"
    volumes:
      - siima_postgres_data:/var/lib/postgresql/data

volumes:
  siima_postgres_data:
```

- [ ] **Step 2: Criar `.env.example`**

```
DATABASE_URL="postgresql://siima:siima_dev_password@localhost:5432/siima?schema=public"
```

- [ ] **Step 3: Criar `.env` (mesmo conteúdo do `.env.example`)**

```
DATABASE_URL="postgresql://siima:siima_dev_password@localhost:5432/siima?schema=public"
```

- [ ] **Step 4: Subir o Postgres e verificar que está aceitando conexões**

Run: `docker compose up -d`
Run: `docker compose exec -T db pg_isready -U siima -d siima`
Expected: a saída contém `accepting connections`

- [ ] **Step 5: Instalar dependências**

Run: `npm install prisma @prisma/client`
Run: `npm install -D tsx`

- [ ] **Step 6: Adicionar scripts utilitários ao `package.json`**

No bloco `"scripts"`, adicionar:

```json
    "db:up": "docker compose up -d",
    "db:down": "docker compose down",
```

- [ ] **Step 7: Commit**

```bash
git add docker-compose.yml .env.example package.json package-lock.json
git commit -m "chore: add local postgres via docker and prisma dependencies"
```

(Não faça `git add .env` — esse arquivo é intencionalmente ignorado.)

---

### Task 2: Schema Prisma, migration e cliente singleton

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`
- Modify: `package.json`
- Test: `scripts/verify-db-connection.ts`

**Interfaces:**
- Consumes: `DATABASE_URL` (Task 1).
- Produces: modelo `Occurrence` e todos os enums exportados de `@prisma/client`; `prisma: PrismaClient` exportado (nomeado) de `src/lib/prisma.ts`, usado pelas tasks seguintes.

- [ ] **Step 1: Criar `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum TipoEntrada {
  ENTREGA_VOLUNTARIA @map("Entrega voluntária")
  REPASSE_TERCEIROS  @map("Repasse por terceiros")
  PRONTO_ATENDIMENTO @map("Pronto Atendimento")
}

enum StatusAnimal {
  Vivo
  Morto
}

enum ClassificacaoOcorrencia {
  RESGATE_REABILITACAO @map("Resgate e Reabilitação")
  COLETA
  REGISTRO
  MANUTENCAO @map("Manutenção")
  ENCALHE
}

enum SimNao {
  Sim
  Nao
}

enum Classe {
  Amphibia
  Aves
  Elasmobranchii
  Mammalia
  Reptilia
}

enum Sexo {
  M
  F
  IN
}

enum FaixaEtaria {
  feto
  filhote
  juvenil
  subadulto
  adulto
}

enum UnidadePeso {
  g
  kg
}

enum CondicaoCorporal {
  boa
  regular
  pessima @map("péssima")
}

enum UnidadeComprimento {
  mm
  cm
  m
}

enum CausaMortisCategoria {
  Antropica @map("Antrópica")
  Patologica @map("Patológica")
  Fisiologica @map("Fisiológica")
  Desconhecida
  Indeterminada
}

enum DestinoFinal {
  soltura
  transferencia
  obito
  colecao_cientifica
  enterro
  incineracao
  maceracao
  doacao
  colecao_cientifica_ima @map("colecao cientifica IMA")
  outro
}

model Occurrence {
  id String @id @default(cuid())

  // Identificação
  tomboIma             String   @unique
  responsavelRegistro  String
  dataOcorrencia       DateTime
  horarioColeta        String
  uf                   String
  municipio            String
  localEspecifico      String
  latitude             Float
  longitude            Float
  nomeFoto             String?

  // Triagem
  tipoEntrada             TipoEntrada
  statusAnimal            StatusAnimal
  classificacaoOcorrencia ClassificacaoOcorrencia
  codeDecomposicao        Int
  interacaoPesca          SimNao
  interacaoPescaDescricao String?

  // Classificação biológica
  classe       Classe
  ordem        String
  familia      String
  genero       String
  especie      String
  nomeComum    String?
  sexo         Sexo
  faixaEtaria  FaixaEtaria
  anilhaNumero String?

  // Avaliação clínica
  pesoEntradaG           Float?
  pesoEntradaGUnidade    UnidadePeso?
  condicaoCorporal       CondicaoCorporal?
  procedimentosClinicos  String? @db.Text
  amostrasAntemortem     String? @db.Text
  biometriaCt            Float?
  biometriaCtUnidade     UnidadeComprimento?
  biometriaCompBico      Float?
  biometriaBicoUnidade   UnidadeComprimento?
  biometriaCcc           Float?
  biometriaCccUnidade    UnidadeComprimento?
  biometriaLcc            Float?
  biometriaLccUnidade     UnidadeComprimento?

  // Necropsia
  responsavelNecropsia    String?
  dataObito                DateTime?
  achadosNecropsia         String? @db.Text
  presencaTumores          SimNao?
  descricaoTumores         String? @db.Text
  causaMortisDiagnostico   String? @db.Text
  causaMortisCategoria     CausaMortisCategoria?
  amostrasPostmortem       String? @db.Text

  // Exames complementares
  resultadoRadiografia     String? @db.Text
  resultadoToxicologico    String? @db.Text
  resultadoHistopatologico String? @db.Text
  achadosBioquimica        String? @db.Text
  achadosHemograma         String? @db.Text
  achadosFezesUrina        String? @db.Text
  resultadoMicrobiologico  String? @db.Text

  // Desfecho do caso
  pesoFinal               Float?
  pesoFinalUnidade        UnidadePeso?
  dataSaida                DateTime?
  destinoFinal             DestinoFinal?
  outroDestinoEspecificar String?
  observacoes              String? @db.Text

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 2: Adicionar `postinstall` e `db:studio` ao `package.json`**

No bloco `"scripts"`, adicionar:

```json
    "db:studio": "prisma studio",
    "postinstall": "prisma generate",
```

- [ ] **Step 3: Validar a sintaxe do schema**

Run: `npx prisma format`
Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 4: Criar e aplicar a primeira migration**

Run: `npx prisma migrate dev --name init_occurrence`
Expected: termina com `Your database is now in sync with your schema.` e gera `prisma/migrations/<timestamp>_init_occurrence/migration.sql`. Isso também gera o Prisma Client (`@prisma/client`).

- [ ] **Step 5: Criar o singleton do Prisma Client em `src/lib/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 6: Escrever o script de verificação de conexão**

Create: `scripts/verify-db-connection.ts`

```typescript
import { prisma } from "@/lib/prisma";

async function main() {
  const count = await prisma.occurrence.count();
  console.log(`OK: conectado ao banco. Ocorrências existentes: ${count}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 7: Rodar o script e confirmar a conexão**

Run: `npx tsx scripts/verify-db-connection.ts`
Expected: `OK: conectado ao banco. Ocorrências existentes: 0`

- [ ] **Step 8: Commit**

```bash
git add prisma package.json src/lib/prisma.ts scripts/verify-db-connection.ts
git commit -m "feat: add prisma schema, migration and client singleton"
```

---

### Task 3: Mapeadores de valores (Zod → Prisma)

**Files:**
- Create: `src/lib/actions/occurrence-mappers.ts`
- Test: `scripts/verify-mappers.ts`

**Interfaces:**
- Consumes: `OccurrenceFormValues` de `src/lib/schemas/occurrenceSchema.ts`; enums de `@prisma/client` (Task 2).
- Produces: `toOccurrenceCreateInput(values: OccurrenceFormValues): Prisma.OccurrenceCreateInput` e a classe `OccurrenceMappingError` (com propriedade pública `field: string`), ambos de `src/lib/actions/occurrence-mappers.ts` — consumidos pela Task 4.

- [ ] **Step 1: Escrever o script de verificação (falhando, pois o mapeador ainda não existe)**

Create: `scripts/verify-mappers.ts`

```typescript
import assert from "node:assert/strict";
import {
  OccurrenceMappingError,
  toOccurrenceCreateInput,
} from "@/lib/actions/occurrence-mappers";
import type { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";

const basePayload: OccurrenceFormValues = {
  tomboIma: "IMA00001",
  responsavelRegistro: "Fulano de Tal",
  dataOcorrencia: "2026-08-08",
  horarioColeta: "10:00",
  uf: "PA",
  municipio: "Belém",
  localEspecifico: "Praia Teste",
  latitude: "-1.4558",
  longitude: "-48.4902",
  tipoEntrada: "Entrega voluntária",
  statusAnimal: "Vivo",
  classificacaoOcorrencia: "Manutenção",
  codeDecomposicao: 1,
  interacaoPesca: "Sim",
  classe: "Mammalia",
  ordem: "Sirenia",
  familia: "Trichechidae",
  genero: "Trichechus",
  especie: "Trichechus inunguis",
  sexo: "IN",
  faixaEtaria: "adulto",
  presencaTumores: "sim",
  condicaoCorporal: "péssima",
  destinoFinal: "colecao cientifica IMA",
};

const result = toOccurrenceCreateInput(basePayload);

assert.equal(result.tipoEntrada, "ENTREGA_VOLUNTARIA");
assert.equal(result.classificacaoOcorrencia, "MANUTENCAO");
assert.equal(result.statusAnimal, "Vivo");
assert.equal(result.interacaoPesca, "Sim");
assert.equal(result.presencaTumores, "Sim");
assert.equal(result.condicaoCorporal, "PESSIMA");
assert.equal(result.destinoFinal, "COLECAO_CIENTIFICA_IMA");
assert.equal(result.latitude, -1.4558);
assert.equal(result.longitude, -48.4902);
assert.deepEqual(result.dataOcorrencia, new Date("2026-08-08"));
assert.equal(result.nomeFoto, undefined);

assert.throws(
  () => toOccurrenceCreateInput({ ...basePayload, latitude: "não é número" }),
  OccurrenceMappingError
);

console.log("OK: mapeadores de ocorrência validados.");
```

- [ ] **Step 2: Rodar o script e confirmar que falha (módulo ainda não existe)**

Run: `npx tsx scripts/verify-mappers.ts`
Expected: erro do tipo `Cannot find module '@/lib/actions/occurrence-mappers'`

- [ ] **Step 3: Implementar `src/lib/actions/occurrence-mappers.ts`**

```typescript
import {
  CausaMortisCategoria,
  ClassificacaoOcorrencia,
  CondicaoCorporal,
  DestinoFinal,
  Prisma,
  SimNao,
  TipoEntrada,
} from "@prisma/client";
import type { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";

export class OccurrenceMappingError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = "OccurrenceMappingError";
  }
}

const TIPO_ENTRADA_MAP: Record<OccurrenceFormValues["tipoEntrada"], TipoEntrada> = {
  "Entrega voluntária": TipoEntrada.ENTREGA_VOLUNTARIA,
  "Repasse por terceiros": TipoEntrada.REPASSE_TERCEIROS,
  "Pronto Atendimento": TipoEntrada.PRONTO_ATENDIMENTO,
};

const CLASSIFICACAO_OCORRENCIA_MAP: Record<
  OccurrenceFormValues["classificacaoOcorrencia"],
  ClassificacaoOcorrencia
> = {
  "Resgate e Reabilitação": ClassificacaoOcorrencia.RESGATE_REABILITACAO,
  Coleta: ClassificacaoOcorrencia.COLETA,
  Registro: ClassificacaoOcorrencia.REGISTRO,
  "Manutenção": ClassificacaoOcorrencia.MANUTENCAO,
  Encalhe: ClassificacaoOcorrencia.ENCALHE,
};

const CONDICAO_CORPORAL_MAP: Record<
  NonNullable<OccurrenceFormValues["condicaoCorporal"]>,
  CondicaoCorporal
> = {
  boa: CondicaoCorporal.boa,
  regular: CondicaoCorporal.regular,
  "péssima": CondicaoCorporal.pessima,
};

const CAUSA_MORTIS_CATEGORIA_MAP: Record<
  NonNullable<OccurrenceFormValues["causaMortisCategoria"]>,
  CausaMortisCategoria
> = {
  "Antrópica": CausaMortisCategoria.Antropica,
  "Patológica": CausaMortisCategoria.Patologica,
  "Fisiológica": CausaMortisCategoria.Fisiologica,
  Desconhecida: CausaMortisCategoria.Desconhecida,
  Indeterminada: CausaMortisCategoria.Indeterminada,
};

const DESTINO_FINAL_MAP: Record<
  NonNullable<OccurrenceFormValues["destinoFinal"]>,
  DestinoFinal
> = {
  soltura: DestinoFinal.soltura,
  transferencia: DestinoFinal.transferencia,
  obito: DestinoFinal.obito,
  colecao_cientifica: DestinoFinal.colecao_cientifica,
  enterro: DestinoFinal.enterro,
  incineracao: DestinoFinal.incineracao,
  maceracao: DestinoFinal.maceracao,
  doacao: DestinoFinal.doacao,
  "colecao cientifica IMA": DestinoFinal.colecao_cientifica_ima,
  outro: DestinoFinal.outro,
};

function parseCoordinate(field: "latitude" | "longitude", raw: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    const label = field === "latitude" ? "Latitude" : "Longitude";
    throw new OccurrenceMappingError(field, `${label} deve ser um número válido.`);
  }
  return value;
}

function emptyToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value === "" ? undefined : value;
}

function mapPresencaTumores(
  value: OccurrenceFormValues["presencaTumores"]
): SimNao | undefined {
  if (value === undefined) return undefined;
  return value === "sim" ? SimNao.Sim : SimNao.Nao;
}

export function toOccurrenceCreateInput(
  values: OccurrenceFormValues
): Prisma.OccurrenceCreateInput {
  return {
    tomboIma: values.tomboIma,
    responsavelRegistro: values.responsavelRegistro,
    dataOcorrencia: new Date(values.dataOcorrencia),
    horarioColeta: values.horarioColeta,
    uf: values.uf,
    municipio: values.municipio,
    localEspecifico: values.localEspecifico,
    latitude: parseCoordinate("latitude", values.latitude),
    longitude: parseCoordinate("longitude", values.longitude),
    nomeFoto: emptyToUndefined(values.nomeFoto),

    tipoEntrada: TIPO_ENTRADA_MAP[values.tipoEntrada],
    statusAnimal: values.statusAnimal,
    classificacaoOcorrencia: CLASSIFICACAO_OCORRENCIA_MAP[values.classificacaoOcorrencia],
    codeDecomposicao: values.codeDecomposicao,
    interacaoPesca: values.interacaoPesca,
    interacaoPescaDescricao: emptyToUndefined(values.interacaoPescaDescricao),

    classe: values.classe,
    ordem: values.ordem,
    familia: values.familia,
    genero: values.genero,
    especie: values.especie,
    nomeComum: emptyToUndefined(values.nomeComum),
    sexo: values.sexo,
    faixaEtaria: values.faixaEtaria,
    anilhaNumero: emptyToUndefined(values.anilhaNumero),

    pesoEntradaG: values.pesoEntradaG,
    pesoEntradaGUnidade: values.pesoEntradaGUnidade,
    condicaoCorporal: values.condicaoCorporal
      ? CONDICAO_CORPORAL_MAP[values.condicaoCorporal]
      : undefined,
    procedimentosClinicos: emptyToUndefined(values.procedimentosClinicos),
    amostrasAntemortem: emptyToUndefined(values.amostrasAntemortem),
    biometriaCt: values.biometriaCt,
    biometriaCtUnidade: values.biometriaCtUnidade,
    biometriaCompBico: values.biometriaCompBico,
    biometriaBicoUnidade: values.biometriaBicoUnidade,
    biometriaCcc: values.biometriaCcc,
    biometriaCccUnidade: values.biometriaCccUnidade,
    biometriaLcc: values.biometriaLcc,
    biometriaLccUnidade: values.biometriaLccUnidade,

    responsavelNecropsia: emptyToUndefined(values.responsavelNecropsia),
    dataObito: values.dataObito ? new Date(values.dataObito) : undefined,
    achadosNecropsia: emptyToUndefined(values.achadosNecropsia),
    presencaTumores: mapPresencaTumores(values.presencaTumores),
    descricaoTumores: emptyToUndefined(values.descricaoTumores),
    causaMortisDiagnostico: emptyToUndefined(values.causaMortisDiagnostico),
    causaMortisCategoria: values.causaMortisCategoria
      ? CAUSA_MORTIS_CATEGORIA_MAP[values.causaMortisCategoria]
      : undefined,
    amostrasPostmortem: emptyToUndefined(values.amostrasPostmortem),

    resultadoRadiografia: emptyToUndefined(values.resultadoRadiografia),
    resultadoToxicologico: emptyToUndefined(values.resultadoToxicologico),
    resultadoHistopatologico: emptyToUndefined(values.resultadoHistopatologico),
    achadosBioquimica: emptyToUndefined(values.achadosBioquimica),
    achadosHemograma: emptyToUndefined(values.achadosHemograma),
    achadosFezesUrina: emptyToUndefined(values.achadosFezesUrina),
    resultadoMicrobiologico: emptyToUndefined(values.resultadoMicrobiologico),

    pesoFinal: values.pesoFinal,
    pesoFinalUnidade: values.pesoFinalUnidade,
    dataSaida: values.dataSaida ? new Date(values.dataSaida) : undefined,
    destinoFinal: values.destinoFinal ? DESTINO_FINAL_MAP[values.destinoFinal] : undefined,
    outroDestinoEspecificar: emptyToUndefined(values.outroDestinoEspecificar),
    observacoes: emptyToUndefined(values.observacoes),
  };
}
```

- [ ] **Step 4: Rodar o script novamente e confirmar que passa**

Run: `npx tsx scripts/verify-mappers.ts`
Expected: `OK: mapeadores de ocorrência validados.`

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/occurrence-mappers.ts scripts/verify-mappers.ts
git commit -m "feat: add zod-to-prisma mappers for occurrence payload"
```

---

### Task 4: Server Action `createOccurrence`

**Files:**
- Create: `src/lib/actions/occurrence.ts`
- Test: `scripts/verify-occurrence-action.ts`

**Interfaces:**
- Consumes: `prisma` (Task 2); `toOccurrenceCreateInput`, `OccurrenceMappingError` (Task 3); `formSchema`, `OccurrenceFormValues` (já existentes em `src/lib/schemas/occurrenceSchema.ts`).
- Produces: `createOccurrence(values: OccurrenceFormValues): Promise<CreateOccurrenceResult>` e o tipo `CreateOccurrenceResult = { success: true; id: string } | { success: false; errors: Record<string, string> }`, ambos de `src/lib/actions/occurrence.ts` — consumidos pela Task 5.

- [ ] **Step 1: Escrever o script de verificação (falhando, pois a Server Action ainda não existe)**

Create: `scripts/verify-occurrence-action.ts`

```typescript
import assert from "node:assert/strict";
import { prisma } from "@/lib/prisma";
import { createOccurrence } from "@/lib/actions/occurrence";
import type { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";

const payload: OccurrenceFormValues = {
  tomboIma: "IMA99999",
  responsavelRegistro: "Script de Verificação",
  dataOcorrencia: "2026-08-08",
  horarioColeta: "10:00",
  uf: "PA",
  municipio: "Belém",
  localEspecifico: "Praia Teste",
  latitude: "-1.4558",
  longitude: "-48.4902",
  tipoEntrada: "Entrega voluntária",
  statusAnimal: "Vivo",
  classificacaoOcorrencia: "Registro",
  codeDecomposicao: 1,
  interacaoPesca: "Nao",
  classe: "Mammalia",
  ordem: "Sirenia",
  familia: "Trichechidae",
  genero: "Trichechus",
  especie: "Trichechus inunguis",
  sexo: "IN",
  faixaEtaria: "adulto",
};

async function main() {
  await prisma.occurrence.deleteMany({ where: { tomboIma: payload.tomboIma } });

  const invalidResult = await createOccurrence({ ...payload, tomboIma: "INVALIDO" });
  assert.equal(invalidResult.success, false);
  assert.ok(!invalidResult.success && invalidResult.errors.tomboIma);

  const created = await createOccurrence(payload);
  assert.equal(created.success, true);
  assert.ok(created.success && created.id);

  const duplicate = await createOccurrence(payload);
  assert.equal(duplicate.success, false);
  assert.ok(!duplicate.success && duplicate.errors.tomboIma);

  await prisma.occurrence.deleteMany({ where: { tomboIma: payload.tomboIma } });
  await prisma.$disconnect();

  console.log(
    "OK: createOccurrence validada (payload inválido, sucesso e tomboIma duplicado)."
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Rodar o script e confirmar que falha (módulo ainda não existe)**

Run: `npx tsx scripts/verify-occurrence-action.ts`
Expected: erro do tipo `Cannot find module '@/lib/actions/occurrence'`

- [ ] **Step 3: Implementar `src/lib/actions/occurrence.ts`**

```typescript
"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formSchema, type OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";
import {
  OccurrenceMappingError,
  toOccurrenceCreateInput,
} from "@/lib/actions/occurrence-mappers";

export type CreateOccurrenceResult =
  | { success: true; id: string }
  | { success: false; errors: Record<string, string> };

export async function createOccurrence(
  values: OccurrenceFormValues
): Promise<CreateOccurrenceResult> {
  const parsed = formSchema.safeParse(values);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in errors)) {
        errors[field] = issue.message;
      }
    }
    return { success: false, errors };
  }

  try {
    const data = toOccurrenceCreateInput(parsed.data);
    const occurrence = await prisma.occurrence.create({ data });
    return { success: true, id: occurrence.id };
  } catch (error) {
    if (error instanceof OccurrenceMappingError) {
      return { success: false, errors: { [error.field]: error.message } };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        errors: { tomboIma: "Já existe um registro com este Tombo IMA." },
      };
    }
    throw error;
  }
}
```

- [ ] **Step 4: Rodar o script novamente e confirmar que passa**

Run: `npx tsx scripts/verify-occurrence-action.ts`
Expected: `OK: createOccurrence validada (payload inválido, sucesso e tomboIma duplicado).`

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/occurrence.ts scripts/verify-occurrence-action.ts
git commit -m "feat: add createOccurrence server action"
```

---

### Task 5: Integração no formulário

**Files:**
- Modify: `src/components/forms/occurrence-form.tsx`

**Interfaces:**
- Consumes: `createOccurrence`, `CreateOccurrenceResult` (Task 4).
- Produces: nenhuma (ponta final da cadeia — é o que o usuário vê).

- [ ] **Step 1: Adicionar os imports necessários**

Em `src/components/forms/occurrence-form.tsx`, no topo do arquivo, junto aos imports existentes:

```typescript
import { useEffect, useTransition } from "react";
```

(substituindo a linha `import { useEffect } from "react";` existente)

E adicionar, junto aos demais imports de `@/lib`:

```typescript
import { createOccurrence } from "@/lib/actions/occurrence";
```

- [ ] **Step 2: Adicionar o estado de transição**

Logo após a declaração de `const { setValue, clearErrors } = form;` (linha 111 do arquivo atual), adicionar:

```typescript
  const [isPending, startTransition] = useTransition();
```

- [ ] **Step 3: Substituir o `onSubmit` mockado**

Substituir o bloco atual:

```typescript
  const onSubmit: SubmitHandler<OccurrenceFormValues> = (data) => {
    // Log para debug (mantemos por enquanto)
    console.log("DADOS VALIDADOS:", JSON.stringify(data, null, 2));

    // Dispara a notificação Toast
    toast.success("Formulário enviado com sucesso!", {
      description: `O registro ${data.tomboIma} foi salvo localmente (Mockup).`,
      duration: 5000,
      action: {
        label: "Ver Console",
        onClick: () => console.log(data),
      },
    });
  };
```

Por:

```typescript
  const onSubmit: SubmitHandler<OccurrenceFormValues> = (data) => {
    startTransition(async () => {
      const result = await createOccurrence(data);

      if (!result.success) {
        Object.entries(result.errors).forEach(([field, message]) => {
          form.setError(field as keyof OccurrenceFormValues, { message });
        });
        toast.error("Não foi possível salvar o registro.", {
          description: "Verifique os campos indicados no formulário.",
        });
        return;
      }

      toast.success("Formulário enviado com sucesso!", {
        description: `O registro ${data.tomboIma} foi salvo (ID: ${result.id}).`,
        duration: 5000,
      });
      form.reset();
    });
  };
```

- [ ] **Step 4: Desabilitar o botão de envio durante o `pending`**

Substituir:

```typescript
        <Button
          type="submit"
          className="bg-brand-button-primary-bg text-brand-button-primary-fg hover:bg-brand-button-primary-bg/90"
        >
          Enviar Formulário
        </Button>
```

Por:

```typescript
        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-button-primary-bg text-brand-button-primary-fg hover:bg-brand-button-primary-bg/90"
        >
          {isPending ? "Enviando..." : "Enviar Formulário"}
        </Button>
```

- [ ] **Step 5: Verificação manual no navegador**

Run: `npm run db:up` (garantir que o Postgres está rodando)
Run: `npm run dev`
No navegador, abrir `http://localhost:3000/`:
1. Preencher o formulário com um `tomboIma` válido (ex.: `IMA00042`) e os demais campos obrigatórios (status `Vivo`, para não precisar preencher a seção de necropsia).
2. Submeter. Esperado: botão mostra "Enviando...", depois toast de sucesso com o ID retornado, e o formulário é limpo.
3. Submeter novamente com o **mesmo** `tomboIma`. Esperado: toast de erro, e o campo "Tombo IMA" exibe a mensagem "Já existe um registro com este Tombo IMA."
4. Rodar `npx prisma studio` (ou `npm run db:studio`), abrir a tabela `Occurrence` e confirmar que o registro do passo 2 está lá com os valores corretos.

- [ ] **Step 6: Commit**

```bash
git add src/components/forms/occurrence-form.tsx
git commit -m "feat: wire occurrence form submit to createOccurrence server action"
```

---

## Depois deste plano

- Autenticação (Clerk) e associação de `responsavelRegistro`/criação a um usuário real.
- Multi-tenancy, se o produto passar a atender mais de um instituto.
- Upload real de foto (`nomeFoto`) para um serviço de storage.
- Migração de Postgres local (Docker) para Neon em produção (só troca de `DATABASE_URL` + `prisma migrate deploy` no pipeline de deploy).
- Telas de listagem/edição de ocorrências.
