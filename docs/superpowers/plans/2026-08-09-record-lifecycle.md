# Ciclo de Vida do Registro de Ocorrência Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o formulário de ocorrência de "preencher tudo de uma vez" em um registro que nasce com o essencial (seções 1–3) e pode ser reaberto e complementado ao longo do tempo — com acordeão, sem numeração, sem a exigência de necropsia imediata, e com telas de listagem e edição.

**Architecture:** Um hook `useEffectSkipFirst` corrige os efeitos de cascata do formulário (que hoje apagam dados ao carregar um registro existente). O Zod deixa de exigir necropsia para animal morto. O formulário vira um acordeão (`OccurrenceSections`, usando o componente `Accordion` do ShadCN) com badges de situação por seção. `occurrence-mappers.ts` ganha o mapeamento inverso (Prisma → Zod), `occurrence-queries.ts` expõe leitura (`listOccurrences`, `getOccurrence`), e `occurrence.ts` ganha `updateOccurrence`. Duas rotas novas (`/registros/novo`, `/registros/[id]`) e a home reescrita como listagem fecham o ciclo.

**Tech Stack:** Next.js 15 (App Router, Server Components), TypeScript, React Hook Form + Zod, Prisma 7 + Supabase (banco real já provisionado e verificado), Radix UI (`@radix-ui/react-accordion`), Tailwind v4 + `tw-animate-css`.

## Global Constraints

- Fonte da verdade dos campos continua `src/lib/schemas/occurrenceSchema.ts` — a única alteração autorizada nele nesta rodada é remover a exigência de `responsavelNecropsia`/`dataObito` quando `statusAnimal === "Morto"`. Nenhuma outra regra do Zod muda.
- Há um banco Supabase real, já migrado e verificado nesta sessão. Toda task que mexe em Prisma deve ser verificada com um script real contra esse banco (não apenas `tsc`/`prisma validate`) — rode `npx tsx scripts/verify-db-connection.ts` a qualquer momento para confirmar que `DATABASE_URL`/`DIRECT_URL` estão configuradas no `.env`.
- Sem numeração nas seções do formulário — nem no título da seção, nem em comentários que sugiram ordem fixa.
- O acordeão é do tipo `multiple`: mais de uma seção pode ficar aberta ao mesmo tempo.
- Um caso é "encerrado" quando `destinoFinal` está preenchido — não existe (e não deve ser criado) um campo de status separado.
- O mínimo para salvar um registro é ter as seções 1–3 (Identificação, Triagem, Classificação) completas — exatamente o que o Zod já exige após a remoção da regra de necropsia. Não adicionar nenhuma outra trava de "mínimo para salvar".
- Datas são armazenadas como `@db.Date` (UTC, sem componente de hora). Qualquer formatação de exibição de data feita nesta rodada (ex.: na listagem) **precisa** usar `timeZone: "UTC"` explicitamente — sem isso, o bug de off-by-one corrigido no branch anterior volta a acontecer.
- Sem autenticação, sem multi-tenancy, sem exclusão de registros, sem paginação na listagem, sem upload de foto — tudo fora de escopo nesta rodada.

---

## File Structure

```
src/hooks/
  use-effect-skip-first.ts          novo — useEffect que não dispara no 1º render

src/components/forms/
  occurrence-form.tsx                reescrito: cria OU edita, usa useEffectSkipFirst
  occurrence-sections.tsx            novo — casca do acordeão com badges de situação
  sections/
    identification-section.tsx       efeito de município corrigido; legend removida
    classification-section.tsx       4 efeitos de cascata corrigidos; legend removida
    triage-section.tsx                legend removida
    clinical-evaluation-section.tsx   legend removida
    necropsy-section.tsx              legend removida
    complementary-exams-section.tsx   legend removida
    case-outcome-section.tsx          legend removida

src/components/ui/
  accordion.tsx                      novo — componente ShadCN (Radix Accordion)

src/components/registros/
  occurrence-list.tsx                novo — abas, busca e lista de registros

src/app/
  page.tsx                           reescrito — listagem (Server Component)
  registros/novo/page.tsx            novo — tela de criação
  registros/[id]/page.tsx            novo — tela de edição
  globals.css                        importa tw-animate-css

src/lib/actions/
  occurrence.ts                      ganha updateOccurrence (+ persistOccurrence compartilhado)
  occurrence-mappers.ts              ganha toOccurrenceFormValues (mapeamento inverso)
  occurrence-queries.ts              novo — listOccurrences, getOccurrence

src/lib/schemas/
  occurrenceSchema.ts                remove a exigência de necropsia

scripts/
  verify-necropsy-optional.ts        novo
  verify-reverse-mapper.ts           novo
  verify-occurrence-queries.ts       novo
  verify-update-occurrence.ts        novo

package.json                        nova dependência @radix-ui/react-accordion
```

---

### Task 1: Hook `useEffectSkipFirst` e correção dos efeitos de cascata

**Files:**
- Create: `src/hooks/use-effect-skip-first.ts`
- Modify: `src/components/forms/occurrence-form.tsx`
- Modify: `src/components/forms/sections/identification-section.tsx`
- Modify: `src/components/forms/sections/classification-section.tsx`

**Interfaces:**
- Consumes: nada (task inicial).
- Produces: `useEffectSkipFirst(effect: () => void, deps: React.DependencyList): void`, exportado de `src/hooks/use-effect-skip-first.ts` — usado pelas Tasks 1 e 7.

**Contexto:** o formulário tem 9 `useEffect`s que limpam campos dependentes quando um valor "pai" muda (ex.: mudar a classe limpa ordem/família/gênero/espécie). Eles disparam também na primeira renderização — o que é inofensivo hoje (formulário sempre começa vazio) mas vai quebrar o modo de edição (Task 7): ao carregar um registro salvo, esses efeitos apagariam os dados carregados antes da tela aparecer. A correção: separar "calcular a lista de opções do dropdown" (deve rodar sempre, inclusive no mount) de "limpar os campos dependentes" (só deve rodar quando o valor realmente mudar, nunca no mount).

- [ ] **Step 1: Criar o hook**

```typescript
// src/hooks/use-effect-skip-first.ts
"use client";

import { useEffect, useRef } from "react";

export function useEffectSkipFirst(
  effect: () => void,
  deps: React.DependencyList
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
```

- [ ] **Step 2: Verificar que compila e não gera warning de lint**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run lint`
Expected: sem erros nem warnings.

- [ ] **Step 3: Corrigir `identification-section.tsx`**

Adicionar o import, logo após os imports existentes:

```typescript
import { useEffectSkipFirst } from "@/hooks/use-effect-skip-first";
```

Substituir o efeito único:

```typescript
  useEffect(() => {
    if (watchedUf) {
      const estadoSelecionado = estados.find((e) => e.uf === watchedUf);
      setMunicipios(estadoSelecionado ? estadoSelecionado.municipios : []);

      setFormValue("municipio", "");
    } else {
      setMunicipios([]);
      setFormValue("municipio", "");
    }
  }, [watchedUf, setFormValue, estados]);
```

Por dois efeitos — um que só calcula a lista de municípios (roda sempre, inclusive no mount) e outro que só limpa o campo dependente (pula o mount):

```typescript
  useEffect(() => {
    if (watchedUf) {
      const estadoSelecionado = estados.find((e) => e.uf === watchedUf);
      setMunicipios(estadoSelecionado ? estadoSelecionado.municipios : []);
    } else {
      setMunicipios([]);
    }
  }, [watchedUf, estados]);

  useEffectSkipFirst(() => {
    setFormValue("municipio", "");
  }, [watchedUf, setFormValue]);
```

- [ ] **Step 4: Corrigir `classification-section.tsx`**

Adicionar o import, logo após os imports existentes:

```typescript
import { useEffectSkipFirst } from "@/hooks/use-effect-skip-first";
```

Substituir os quatro efeitos de cascata (do `useEffect` de `watchedClasse` até o de `watchedGenero` — **não mexer** no quinto efeito, o que sincroniza `nomeComum` a partir de `watchedEspecie`, esse continua um `useEffect` normal):

```typescript
  // --- useEffects (Lógica de Cascata) ---
  useEffect(() => {
    let ordensData: string[] = [];
    if (watchedClasse && typedSpeciesData[watchedClasse]) {
      ordensData = Object.keys(typedSpeciesData[watchedClasse]).sort();
    }
    setOrdens(ordensData);
    setFormValue("ordem", "");
    setFormValue("familia", "");
    setFormValue("genero", "");
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [watchedClasse, setFormValue]);

  useEffect(() => {
    let familiasData: string[] = [];
    if (
      watchedClasse &&
      watchedOrdem &&
      typedSpeciesData[watchedClasse]?.[watchedOrdem]
    ) {
      familiasData = Object.keys(
        typedSpeciesData[watchedClasse][watchedOrdem]
      ).sort();
    }
    setFamilias(familiasData);
    setFormValue("familia", "");
    setFormValue("genero", "");
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [watchedClasse, watchedOrdem, setFormValue]);

  useEffect(() => {
    let generosData: string[] = [];
    if (
      watchedClasse &&
      watchedOrdem &&
      watchedFamilia &&
      typedSpeciesData[watchedClasse]?.[watchedOrdem]?.[watchedFamilia]
    ) {
      generosData = Object.keys(
        typedSpeciesData[watchedClasse][watchedOrdem][watchedFamilia]
      ).sort();
    }
    setGeneros(generosData);
    setFormValue("genero", "");
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [watchedClasse, watchedOrdem, watchedFamilia, setFormValue]);

  useEffect(() => {
    let especiesData: EspecieInfo[] = [];
    if (
      watchedClasse &&
      watchedOrdem &&
      watchedFamilia &&
      watchedGenero &&
      typedSpeciesData[watchedClasse]?.[watchedOrdem]?.[watchedFamilia]?.[
        watchedGenero
      ]
    ) {
      especiesData =
        typedSpeciesData[watchedClasse][watchedOrdem][watchedFamilia][
          watchedGenero
        ];
    }
    setEspecies(especiesData);
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [
    watchedClasse,
    watchedOrdem,
    watchedFamilia,
    watchedGenero,
    setFormValue,
  ]);
```

Por:

```typescript
  // --- useEffects (Lógica de Cascata) ---
  useEffect(() => {
    let ordensData: string[] = [];
    if (watchedClasse && typedSpeciesData[watchedClasse]) {
      ordensData = Object.keys(typedSpeciesData[watchedClasse]).sort();
    }
    setOrdens(ordensData);
  }, [watchedClasse]);

  useEffectSkipFirst(() => {
    setFormValue("ordem", "");
    setFormValue("familia", "");
    setFormValue("genero", "");
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [watchedClasse, setFormValue]);

  useEffect(() => {
    let familiasData: string[] = [];
    if (
      watchedClasse &&
      watchedOrdem &&
      typedSpeciesData[watchedClasse]?.[watchedOrdem]
    ) {
      familiasData = Object.keys(
        typedSpeciesData[watchedClasse][watchedOrdem]
      ).sort();
    }
    setFamilias(familiasData);
  }, [watchedClasse, watchedOrdem]);

  useEffectSkipFirst(() => {
    setFormValue("familia", "");
    setFormValue("genero", "");
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [watchedClasse, watchedOrdem, setFormValue]);

  useEffect(() => {
    let generosData: string[] = [];
    if (
      watchedClasse &&
      watchedOrdem &&
      watchedFamilia &&
      typedSpeciesData[watchedClasse]?.[watchedOrdem]?.[watchedFamilia]
    ) {
      generosData = Object.keys(
        typedSpeciesData[watchedClasse][watchedOrdem][watchedFamilia]
      ).sort();
    }
    setGeneros(generosData);
  }, [watchedClasse, watchedOrdem, watchedFamilia]);

  useEffectSkipFirst(() => {
    setFormValue("genero", "");
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [watchedClasse, watchedOrdem, watchedFamilia, setFormValue]);

  useEffect(() => {
    let especiesData: EspecieInfo[] = [];
    if (
      watchedClasse &&
      watchedOrdem &&
      watchedFamilia &&
      watchedGenero &&
      typedSpeciesData[watchedClasse]?.[watchedOrdem]?.[watchedFamilia]?.[
        watchedGenero
      ]
    ) {
      especiesData =
        typedSpeciesData[watchedClasse][watchedOrdem][watchedFamilia][
          watchedGenero
        ];
    }
    setEspecies(especiesData);
  }, [watchedClasse, watchedOrdem, watchedFamilia, watchedGenero]);

  useEffectSkipFirst(() => {
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [
    watchedClasse,
    watchedOrdem,
    watchedFamilia,
    watchedGenero,
    setFormValue,
  ]);
```

- [ ] **Step 5: Corrigir os 4 efeitos de `occurrence-form.tsx`**

Trocar o import do React (linha 3) de:

```typescript
import { useEffect, useTransition } from "react";
```

Para:

```typescript
import { useTransition } from "react";
```

E adicionar o import do hook, junto aos demais imports de `@/lib`/`@/hooks`:

```typescript
import { useEffectSkipFirst } from "@/hooks/use-effect-skip-first";
```

Substituir os 4 blocos `useEffect` (lógica do CODE, limpeza de necropsia, limpeza de interação com pesca, limpeza de anilha) trocando cada `useEffect` por `useEffectSkipFirst` — **o corpo e o array de dependências de cada um continuam exatamente iguais**, só o nome da função muda:

```typescript
  // Lógica do CODE
  useEffectSkipFirst(() => {
    if (watchedStatusAnimal === "Vivo") {
      setValue("codeDecomposicao", 1);
      clearErrors("codeDecomposicao");
    } else if (watchedStatusAnimal === "Morto") {
      setValue("codeDecomposicao", 0); // 0 força erro no Zod (min 1/2), obrigando escolha
    }
  }, [watchedStatusAnimal, setValue, clearErrors]);

  // Limpeza de campos condicionais
  useEffectSkipFirst(() => {
    if (watchedStatusAnimal === "Vivo") {
      setValue("responsavelNecropsia", "");
      setValue("dataObito", "");
      setValue("achadosNecropsia", "");
      setValue("presencaTumores", undefined);
      setValue("descricaoTumores", "");
      setValue("causaMortisDiagnostico", "");
      setValue("causaMortisCategoria", undefined);
      setValue("amostrasPostmortem", "");
      clearErrors();
    }
  }, [watchedStatusAnimal, setValue, clearErrors]);

  useEffectSkipFirst(() => {
    if (watchedInteracaoPesca === "Nao") {
      setValue("interacaoPescaDescricao", "");
      clearErrors("interacaoPescaDescricao");
    }
  }, [watchedInteracaoPesca, setValue, clearErrors]);

  useEffectSkipFirst(() => {
    if (watchedClasse !== "Aves" && watchedClasse !== "Reptilia") {
      setValue("anilhaNumero", "");
      clearErrors("anilhaNumero");
    }
  }, [watchedClasse, setValue, clearErrors]);
```

- [ ] **Step 6: Verificar tipos e lint**

Run: `npx tsc --noEmit`
Expected: sem erros.

Run: `npm run lint`
Expected: sem erros nem warnings.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-effect-skip-first.ts src/components/forms/occurrence-form.tsx src/components/forms/sections/identification-section.tsx src/components/forms/sections/classification-section.tsx
git commit -m "fix: skip cascading field-clear effects on initial render"
```

---

### Task 2: Remover a exigência de necropsia obrigatória

**Files:**
- Modify: `src/lib/schemas/occurrenceSchema.ts`
- Test: `scripts/verify-necropsy-optional.ts`

**Interfaces:**
- Consumes: nada.
- Produces: nenhuma interface nova — apenas remove uma regra de `formSchema`, consumido pelas Tasks 4-9.

- [ ] **Step 1: Escrever o script de verificação (falhando, pois a regra ainda existe)**

Create: `scripts/verify-necropsy-optional.ts`

```typescript
import assert from "node:assert/strict";
import { formSchema } from "@/lib/schemas/occurrenceSchema";

const base = {
  tomboIma: "IMA00001",
  responsavelRegistro: "Fulano",
  dataOcorrencia: "2026-08-09",
  horarioColeta: "10:00",
  uf: "PA",
  municipio: "Belém",
  localEspecifico: "Praia Teste",
  latitude: "-1.4558",
  longitude: "-48.4902",
  tipoEntrada: "Entrega voluntária",
  statusAnimal: "Morto",
  classificacaoOcorrencia: "Registro",
  codeDecomposicao: 2,
  interacaoPesca: "Nao",
  classe: "Mammalia",
  ordem: "Sirenia",
  familia: "Trichechidae",
  genero: "Trichechus",
  especie: "Trichechus inunguis",
  sexo: "IN",
  faixaEtaria: "adulto",
};

const result = formSchema.safeParse(base);
if (!result.success) {
  console.error(result.error.issues);
}
assert.equal(
  result.success,
  true,
  "animal Morto sem responsavelNecropsia/dataObito deve validar"
);
console.log(
  "OK: animal Morto sem responsavelNecropsia/dataObito passa na validação."
);
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx tsx scripts/verify-necropsy-optional.ts`
Expected: `AssertionError` — a regra atual ainda exige `responsavelNecropsia`/`dataObito`.

- [ ] **Step 3: Remover a regra em `occurrenceSchema.ts`**

Dentro do `.superRefine`, remover este bloco por completo (fica entre o bloco de "Interação Pesca" e o de "Desfecho Outro"):

```typescript
    // Necropsia Obrigatória se Morto
    if (data.statusAnimal === "Morto") {
      if (!data.responsavelNecropsia)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Obrigatório.",
          path: ["responsavelNecropsia"],
        });
      if (!data.dataObito)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Obrigatório.",
          path: ["dataObito"],
        });
    }

```

`responsavelNecropsia` e `dataObito` continuam declarados como `z.string().optional()` no objeto do schema — nenhuma outra mudança é necessária, eles já eram opcionais fora do `superRefine`.

- [ ] **Step 4: Rodar de novo e confirmar que passa**

Run: `npx tsx scripts/verify-necropsy-optional.ts`
Expected: `OK: animal Morto sem responsavelNecropsia/dataObito passa na validação.`

- [ ] **Step 5: Confirmar que as demais regras do `superRefine` continuam intactas**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros. (As regras de CODE, interação com pesca, desfecho "outro" e tumores não foram tocadas — este é só um check de que nada mais quebrou.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/schemas/occurrenceSchema.ts scripts/verify-necropsy-optional.ts
git commit -m "feat: make necropsy fields optional for animals marked as deceased"
```

---

### Task 3: Componente Accordion (ShadCN)

**Files:**
- Create: `src/components/ui/accordion.tsx`
- Modify: `src/app/globals.css`
- Modify: `package.json` (via `npm install`)
- Test: `src/app/scratch-accordion-test/page.tsx` (temporário — removido no fim da task)

**Interfaces:**
- Consumes: nada.
- Produces: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`, exportados de `src/components/ui/accordion.tsx` — usados pela Task 7.

- [ ] **Step 1: Instalar a dependência**

Run: `npm install @radix-ui/react-accordion`

- [ ] **Step 2: Criar o componente**

```typescript
// src/components/ui/accordion.tsx
"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```

- [ ] **Step 3: Importar as animações do acordeão no CSS global**

Em `src/app/globals.css`, a `tw-animate-css` já está instalada como dependência (usada por outras animações do projeto) mas não estava importada. Adicionar logo abaixo do import do Tailwind:

```css
/* src/app/globals.css */

@import "tailwindcss";
@import "tw-animate-css";
```

(O restante do arquivo continua igual — só adicione essa linha logo após `@import "tailwindcss";`.)

- [ ] **Step 4: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 5: Criar uma página de teste temporária e verificar no navegador**

Create: `src/app/scratch-accordion-test/page.tsx`

```typescript
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function ScratchAccordionTest() {
  return (
    <Accordion type="multiple" defaultValue={["a"]}>
      <AccordionItem value="a">
        <AccordionTrigger>SCRATCH_MARKER_A</AccordionTrigger>
        <AccordionContent>Conteúdo A</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>SCRATCH_MARKER_B</AccordionTrigger>
        <AccordionContent>Conteúdo B</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

Run: `npm run dev` (em background)
Run: `curl -s -o /tmp/accordion-test.html -w "HTTP %{http_code}\n" http://localhost:3000/scratch-accordion-test`
Expected: `HTTP 200`

Run: `grep -o "SCRATCH_MARKER_A\|SCRATCH_MARKER_B\|Conteúdo A" /tmp/accordion-test.html | sort -u`
Expected: as três linhas aparecem (confirma que o item "a" renderiza aberto por padrão — `defaultValue={["a"]}` — e o item "b" existe).

Pare o servidor de dev (`pkill -f "next dev"`) e apague a página de teste:

Run: `rm -rf src/app/scratch-accordion-test`

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/accordion.tsx src/app/globals.css package.json package-lock.json
git commit -m "feat: add Accordion UI primitive"
```

---

### Task 4: Mapeamento inverso (Prisma → formulário)

**Files:**
- Modify: `src/lib/actions/occurrence-mappers.ts`
- Test: `scripts/verify-reverse-mapper.ts`

**Interfaces:**
- Consumes: `Occurrence` (tipo do Prisma Client), `OccurrenceFormValues` (de `occurrenceSchema.ts`), e reaproveita nada de `toOccurrenceCreateInput` (é uma função nova e independente, só compartilha o arquivo).
- Produces: `toOccurrenceFormValues(occurrence: Occurrence): OccurrenceFormValues`, exportado de `src/lib/actions/occurrence-mappers.ts` — usado pelas Tasks 8 e 9 (páginas `/registros/[id]`).

**Contexto:** esta é a direção oposta do mapeador que já existe (`toOccurrenceCreateInput`). Ela converte um registro já salvo no banco de volta para o formato que o formulário espera — usada para popular o formulário no modo de edição.

- [ ] **Step 1: Escrever o script de verificação (falhando, pois a função ainda não existe)**

Create: `scripts/verify-reverse-mapper.ts`

```typescript
import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "@/lib/prisma";
import { createOccurrence } from "@/lib/actions/occurrence";
import { toOccurrenceFormValues } from "@/lib/actions/occurrence-mappers";
import type { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";

const TOMBO = "IMA88801";

async function cleanup() {
  await prisma.occurrence.deleteMany({ where: { tomboIma: TOMBO } });
}

async function main() {
  await cleanup();

  const payload: OccurrenceFormValues = {
    tomboIma: TOMBO,
    responsavelRegistro: "Script de Verificação",
    dataOcorrencia: "2026-08-09",
    horarioColeta: "14:30",
    uf: "PA",
    municipio: "Belém",
    localEspecifico: "Praia Teste",
    latitude: "-1.4558",
    longitude: "-48.4902",
    nomeFoto: "",
    tipoEntrada: "Entrega voluntária",
    statusAnimal: "Morto",
    classificacaoOcorrencia: "Resgate e Reabilitação",
    codeDecomposicao: 2,
    interacaoPesca: "Sim",
    interacaoPescaDescricao: "Encontrado em rede de pesca",
    classe: "Mammalia",
    ordem: "Sirenia",
    familia: "Trichechidae",
    genero: "Trichechus",
    especie: "Trichechus inunguis",
    nomeComum: "Peixe-boi da Amazônia",
    sexo: "F",
    faixaEtaria: "adulto",
    pesoEntradaG: 45,
    pesoEntradaGUnidade: "kg",
    condicaoCorporal: "péssima",
    biometriaCompBico: 12.5,
    biometriaBicoUnidade: "cm",
    biometriaCcc: 200,
    biometriaCccUnidade: "cm",
    biometriaLcc: 90,
    biometriaLccUnidade: "cm",
    responsavelNecropsia: "Dra. Verificação",
    dataObito: "2026-08-08",
    presencaTumores: "sim",
    descricaoTumores: "Nódulo na nadadeira",
    causaMortisCategoria: "Antrópica",
  };

  const created = await createOccurrence(payload);
  if (!created.success) {
    console.error(created.errors);
    throw new Error("createOccurrence falhou");
  }

  const occurrence = await prisma.occurrence.findUniqueOrThrow({
    where: { id: created.id },
  });
  const formValues = toOccurrenceFormValues(occurrence);

  assert.equal(formValues.tomboIma, payload.tomboIma);
  assert.equal(formValues.dataOcorrencia, payload.dataOcorrencia);
  assert.equal(formValues.dataObito, payload.dataObito);
  assert.equal(formValues.latitude, payload.latitude);
  assert.equal(formValues.longitude, payload.longitude);
  assert.equal(formValues.tipoEntrada, payload.tipoEntrada);
  assert.equal(
    formValues.classificacaoOcorrencia,
    payload.classificacaoOcorrencia
  );
  assert.equal(formValues.condicaoCorporal, payload.condicaoCorporal);
  assert.equal(formValues.causaMortisCategoria, payload.causaMortisCategoria);
  assert.equal(formValues.presencaTumores, payload.presencaTumores);
  assert.equal(formValues.biometriaBicoUnidade, payload.biometriaBicoUnidade);
  assert.equal(formValues.biometriaCccUnidade, payload.biometriaCccUnidade);
  assert.equal(formValues.biometriaLccUnidade, payload.biometriaLccUnidade);
  assert.equal(formValues.nomeFoto, "");

  await cleanup();
  await prisma.$disconnect();
  console.log(
    "OK: toOccurrenceFormValues reverte corretamente um registro real do banco."
  );
}

main().catch(async (error) => {
  console.error(error);
  await cleanup();
  process.exit(1);
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx tsx scripts/verify-reverse-mapper.ts`
Expected: erro do tipo `Cannot find name 'toOccurrenceFormValues'` ou `has no exported member`.

- [ ] **Step 3: Implementar `toOccurrenceFormValues` em `occurrence-mappers.ts`**

No topo do arquivo, adicionar `Occurrence` ao import existente de `@prisma/client`:

```typescript
import {
  CausaMortisCategoria,
  ClassificacaoOcorrencia,
  CondicaoCorporal,
  DestinoFinal,
  Prisma,
  SimNao,
  TipoEntrada,
  type Occurrence,
} from "@prisma/client";
import type { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";
```

No final do arquivo, depois da função `toOccurrenceCreateInput` existente, adicionar:

```typescript

const TIPO_ENTRADA_REVERSE_MAP: Record<TipoEntrada, OccurrenceFormValues["tipoEntrada"]> = {
  [TipoEntrada.ENTREGA_VOLUNTARIA]: "Entrega voluntária",
  [TipoEntrada.REPASSE_TERCEIROS]: "Repasse por terceiros",
  [TipoEntrada.PRONTO_ATENDIMENTO]: "Pronto Atendimento",
};

const CLASSIFICACAO_OCORRENCIA_REVERSE_MAP: Record<
  ClassificacaoOcorrencia,
  OccurrenceFormValues["classificacaoOcorrencia"]
> = {
  [ClassificacaoOcorrencia.RESGATE_REABILITACAO]: "Resgate e Reabilitação",
  [ClassificacaoOcorrencia.COLETA]: "Coleta",
  [ClassificacaoOcorrencia.REGISTRO]: "Registro",
  [ClassificacaoOcorrencia.MANUTENCAO]: "Manutenção",
  [ClassificacaoOcorrencia.ENCALHE]: "Encalhe",
};

const CONDICAO_CORPORAL_REVERSE_MAP: Record<
  CondicaoCorporal,
  NonNullable<OccurrenceFormValues["condicaoCorporal"]>
> = {
  [CondicaoCorporal.boa]: "boa",
  [CondicaoCorporal.regular]: "regular",
  [CondicaoCorporal.pessima]: "péssima",
};

const CAUSA_MORTIS_CATEGORIA_REVERSE_MAP: Record<
  CausaMortisCategoria,
  NonNullable<OccurrenceFormValues["causaMortisCategoria"]>
> = {
  [CausaMortisCategoria.Antropica]: "Antrópica",
  [CausaMortisCategoria.Patologica]: "Patológica",
  [CausaMortisCategoria.Fisiologica]: "Fisiológica",
  [CausaMortisCategoria.Desconhecida]: "Desconhecida",
  [CausaMortisCategoria.Indeterminada]: "Indeterminada",
};

const DESTINO_FINAL_REVERSE_MAP: Record<
  DestinoFinal,
  NonNullable<OccurrenceFormValues["destinoFinal"]>
> = {
  [DestinoFinal.soltura]: "soltura",
  [DestinoFinal.transferencia]: "transferencia",
  [DestinoFinal.obito]: "obito",
  [DestinoFinal.colecao_cientifica]: "colecao_cientifica",
  [DestinoFinal.enterro]: "enterro",
  [DestinoFinal.incineracao]: "incineracao",
  [DestinoFinal.maceracao]: "maceracao",
  [DestinoFinal.doacao]: "doacao",
  [DestinoFinal.colecao_cientifica_ima]: "colecao cientifica IMA",
  [DestinoFinal.outro]: "outro",
};

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toFormString(value: string | null): string {
  return value ?? "";
}

function mapPresencaTumoresToForm(
  value: SimNao | null
): OccurrenceFormValues["presencaTumores"] {
  if (value === null) return undefined;
  return value === SimNao.Sim ? "sim" : "nao";
}

export function toOccurrenceFormValues(
  occurrence: Occurrence
): OccurrenceFormValues {
  return {
    tomboIma: occurrence.tomboIma,
    responsavelRegistro: occurrence.responsavelRegistro,
    dataOcorrencia: formatDateOnly(occurrence.dataOcorrencia),
    horarioColeta: occurrence.horarioColeta,
    uf: occurrence.uf,
    municipio: occurrence.municipio,
    localEspecifico: occurrence.localEspecifico,
    latitude: String(occurrence.latitude),
    longitude: String(occurrence.longitude),
    nomeFoto: toFormString(occurrence.nomeFoto),

    tipoEntrada: TIPO_ENTRADA_REVERSE_MAP[occurrence.tipoEntrada],
    statusAnimal: occurrence.statusAnimal,
    classificacaoOcorrencia:
      CLASSIFICACAO_OCORRENCIA_REVERSE_MAP[occurrence.classificacaoOcorrencia],
    codeDecomposicao: occurrence.codeDecomposicao,
    interacaoPesca: occurrence.interacaoPesca,
    interacaoPescaDescricao: toFormString(occurrence.interacaoPescaDescricao),

    classe: occurrence.classe,
    ordem: occurrence.ordem,
    familia: occurrence.familia,
    genero: occurrence.genero,
    especie: occurrence.especie,
    nomeComum: toFormString(occurrence.nomeComum),
    sexo: occurrence.sexo,
    faixaEtaria: occurrence.faixaEtaria,
    anilhaNumero: toFormString(occurrence.anilhaNumero),

    pesoEntradaG: occurrence.pesoEntradaG ?? undefined,
    pesoEntradaGUnidade: occurrence.pesoEntradaGUnidade ?? undefined,
    condicaoCorporal: occurrence.condicaoCorporal
      ? CONDICAO_CORPORAL_REVERSE_MAP[occurrence.condicaoCorporal]
      : undefined,
    procedimentosClinicos: toFormString(occurrence.procedimentosClinicos),
    amostrasAntemortem: toFormString(occurrence.amostrasAntemortem),
    biometriaCt: occurrence.biometriaCt ?? undefined,
    biometriaCtUnidade: occurrence.biometriaCtUnidade ?? undefined,
    biometriaCompBico: occurrence.biometriaCompBico ?? undefined,
    // UnidadeComprimento no Prisma é "mm"|"cm"|"m" para os 4 campos de
    // biometria, mas o Zod restringe cada campo a um subconjunto (bico:
    // "cm"|"mm"; ccc/lcc: "cm"|"m") — decisão já registrada, o Zod
    // revalida no submit se o valor não fizer sentido para o campo.
    biometriaBicoUnidade: occurrence.biometriaBicoUnidade as
      | OccurrenceFormValues["biometriaBicoUnidade"]
      | undefined ?? undefined,
    biometriaCcc: occurrence.biometriaCcc ?? undefined,
    biometriaCccUnidade: occurrence.biometriaCccUnidade as
      | OccurrenceFormValues["biometriaCccUnidade"]
      | undefined ?? undefined,
    biometriaLcc: occurrence.biometriaLcc ?? undefined,
    biometriaLccUnidade: occurrence.biometriaLccUnidade as
      | OccurrenceFormValues["biometriaLccUnidade"]
      | undefined ?? undefined,

    responsavelNecropsia: toFormString(occurrence.responsavelNecropsia),
    dataObito: occurrence.dataObito ? formatDateOnly(occurrence.dataObito) : "",
    achadosNecropsia: toFormString(occurrence.achadosNecropsia),
    presencaTumores: mapPresencaTumoresToForm(occurrence.presencaTumores),
    descricaoTumores: toFormString(occurrence.descricaoTumores),
    causaMortisDiagnostico: toFormString(occurrence.causaMortisDiagnostico),
    causaMortisCategoria: occurrence.causaMortisCategoria
      ? CAUSA_MORTIS_CATEGORIA_REVERSE_MAP[occurrence.causaMortisCategoria]
      : undefined,
    amostrasPostmortem: toFormString(occurrence.amostrasPostmortem),

    resultadoRadiografia: toFormString(occurrence.resultadoRadiografia),
    resultadoToxicologico: toFormString(occurrence.resultadoToxicologico),
    resultadoHistopatologico: toFormString(occurrence.resultadoHistopatologico),
    achadosBioquimica: toFormString(occurrence.achadosBioquimica),
    achadosHemograma: toFormString(occurrence.achadosHemograma),
    achadosFezesUrina: toFormString(occurrence.achadosFezesUrina),
    resultadoMicrobiologico: toFormString(occurrence.resultadoMicrobiologico),

    pesoFinal: occurrence.pesoFinal ?? undefined,
    pesoFinalUnidade: occurrence.pesoFinalUnidade ?? undefined,
    dataSaida: occurrence.dataSaida ? formatDateOnly(occurrence.dataSaida) : "",
    destinoFinal: occurrence.destinoFinal
      ? DESTINO_FINAL_REVERSE_MAP[occurrence.destinoFinal]
      : undefined,
    outroDestinoEspecificar: toFormString(occurrence.outroDestinoEspecificar),
    observacoes: toFormString(occurrence.observacoes),
  };
}
```

- [ ] **Step 4: Rodar de novo e confirmar que passa**

Run: `npx tsx scripts/verify-reverse-mapper.ts`
Expected: `OK: toOccurrenceFormValues reverte corretamente um registro real do banco.`

- [ ] **Step 5: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/lib/actions/occurrence-mappers.ts scripts/verify-reverse-mapper.ts
git commit -m "feat: add reverse mapper from Prisma Occurrence to form values"
```

---

### Task 5: Queries de leitura (`listOccurrences`, `getOccurrence`)

**Files:**
- Create: `src/lib/actions/occurrence-queries.ts`
- Test: `scripts/verify-occurrence-queries.ts`

**Interfaces:**
- Consumes: `prisma` (de `@/lib/prisma`), `createOccurrence` (de `@/lib/actions/occurrence`, já existente — usado só no script de verificação para popular dados de teste).
- Produces: `listOccurrences(params: { situacao?: OccurrenceSituacao; busca?: string }): Promise<OccurrenceListItem[]>`, `getOccurrence(id: string): Promise<Occurrence | null>`, e os tipos `OccurrenceSituacao = "aberto" | "encerrado" | "todos"` e `OccurrenceListItem`, todos exportados de `src/lib/actions/occurrence-queries.ts` — usados pelas Tasks 8 e 9.

- [ ] **Step 1: Escrever o script de verificação (falhando, pois o arquivo ainda não existe)**

Create: `scripts/verify-occurrence-queries.ts`

```typescript
import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "@/lib/prisma";
import { createOccurrence } from "@/lib/actions/occurrence";
import {
  listOccurrences,
  getOccurrence,
} from "@/lib/actions/occurrence-queries";
import type { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";

const TOMBO_ABERTO = "IMA88802";
const TOMBO_ENCERRADO = "IMA88803";

function basePayload(tomboIma: string): OccurrenceFormValues {
  return {
    tomboIma,
    responsavelRegistro: "Script de Verificação",
    dataOcorrencia: "2026-08-09",
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
}

async function cleanup() {
  await prisma.occurrence.deleteMany({
    where: { tomboIma: { in: [TOMBO_ABERTO, TOMBO_ENCERRADO] } },
  });
}

async function main() {
  await cleanup();

  const aberto = await createOccurrence(basePayload(TOMBO_ABERTO));
  if (!aberto.success) throw new Error("falha ao criar registro aberto");

  const encerradoPayload = basePayload(TOMBO_ENCERRADO);
  encerradoPayload.destinoFinal = "soltura";
  const encerrado = await createOccurrence(encerradoPayload);
  if (!encerrado.success) throw new Error("falha ao criar registro encerrado");

  const abertos = await listOccurrences({ situacao: "aberto" });
  assert.ok(abertos.some((o) => o.tomboIma === TOMBO_ABERTO));
  assert.ok(!abertos.some((o) => o.tomboIma === TOMBO_ENCERRADO));
  console.log("1/4 OK: listOccurrences(aberto) filtra corretamente");

  const encerrados = await listOccurrences({ situacao: "encerrado" });
  assert.ok(encerrados.some((o) => o.tomboIma === TOMBO_ENCERRADO));
  assert.ok(!encerrados.some((o) => o.tomboIma === TOMBO_ABERTO));
  console.log("2/4 OK: listOccurrences(encerrado) filtra corretamente");

  const busca = await listOccurrences({ busca: "Trichechus inunguis" });
  assert.ok(busca.some((o) => o.tomboIma === TOMBO_ABERTO));
  assert.ok(busca.some((o) => o.tomboIma === TOMBO_ENCERRADO));
  console.log("3/4 OK: listOccurrences busca por espécie");

  const fetched = await getOccurrence(aberto.id);
  assert.ok(fetched);
  assert.equal(fetched?.tomboIma, TOMBO_ABERTO);
  const missing = await getOccurrence("id-que-nao-existe");
  assert.equal(missing, null);
  console.log(
    "4/4 OK: getOccurrence retorna o registro certo e null quando não existe"
  );

  await cleanup();
  await prisma.$disconnect();
  console.log("OK: occurrence-queries validado contra o banco real.");
}

main().catch(async (error) => {
  console.error(error);
  await cleanup();
  process.exit(1);
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx tsx scripts/verify-occurrence-queries.ts`
Expected: erro `Cannot find module '@/lib/actions/occurrence-queries'`.

- [ ] **Step 3: Implementar `occurrence-queries.ts`**

```typescript
// src/lib/actions/occurrence-queries.ts
import { Prisma, type Occurrence } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type OccurrenceSituacao = "aberto" | "encerrado" | "todos";

export type OccurrenceListItem = Pick<
  Occurrence,
  "id" | "tomboIma" | "especie" | "nomeComum" | "dataOcorrencia" | "destinoFinal"
>;

export async function listOccurrences(params: {
  situacao?: OccurrenceSituacao;
  busca?: string;
}): Promise<OccurrenceListItem[]> {
  const { situacao = "todos", busca } = params;

  const where: Prisma.OccurrenceWhereInput = {};

  if (situacao === "aberto") {
    where.destinoFinal = null;
  } else if (situacao === "encerrado") {
    where.destinoFinal = { not: null };
  }

  if (busca) {
    where.OR = [
      { tomboIma: { contains: busca, mode: "insensitive" } },
      { especie: { contains: busca, mode: "insensitive" } },
      { municipio: { contains: busca, mode: "insensitive" } },
    ];
  }

  return prisma.occurrence.findMany({
    where,
    orderBy: { dataOcorrencia: "desc" },
    select: {
      id: true,
      tomboIma: true,
      especie: true,
      nomeComum: true,
      dataOcorrencia: true,
      destinoFinal: true,
    },
  });
}

export async function getOccurrence(id: string): Promise<Occurrence | null> {
  return prisma.occurrence.findUnique({ where: { id } });
}
```

- [ ] **Step 4: Rodar de novo e confirmar que passa**

Run: `npx tsx scripts/verify-occurrence-queries.ts`
Expected: as 4 linhas `OK` e `OK: occurrence-queries validado contra o banco real.`

- [ ] **Step 5: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/lib/actions/occurrence-queries.ts scripts/verify-occurrence-queries.ts
git commit -m "feat: add listOccurrences and getOccurrence queries"
```

---

### Task 6: Server Action `updateOccurrence`

**Files:**
- Modify: `src/lib/actions/occurrence.ts`
- Test: `scripts/verify-update-occurrence.ts`

**Interfaces:**
- Consumes: `getOccurrence` (de `@/lib/actions/occurrence-queries`, Task 5 — usado só no script de verificação).
- Produces: `updateOccurrence(id: string, values: OccurrenceFormValues): Promise<CreateOccurrenceResult>`, exportado de `src/lib/actions/occurrence.ts` — usado pela Task 7 (`occurrence-form.tsx`).

- [ ] **Step 1: Escrever o script de verificação (falhando, pois `updateOccurrence` ainda não existe)**

Create: `scripts/verify-update-occurrence.ts`

```typescript
import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "@/lib/prisma";
import { createOccurrence, updateOccurrence } from "@/lib/actions/occurrence";
import { getOccurrence } from "@/lib/actions/occurrence-queries";
import type { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";

const TOMBO_A = "IMA88804";
const TOMBO_B = "IMA88805";

function basePayload(tomboIma: string): OccurrenceFormValues {
  return {
    tomboIma,
    responsavelRegistro: "Script de Verificação",
    dataOcorrencia: "2026-08-09",
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
}

async function cleanup() {
  await prisma.occurrence.deleteMany({
    where: { tomboIma: { in: [TOMBO_A, TOMBO_B] } },
  });
}

async function main() {
  await cleanup();

  const created = await createOccurrence(basePayload(TOMBO_A));
  if (!created.success) throw new Error("falha ao criar registro base");

  // 1. Atualiza e adiciona o desfecho (fecha o caso)
  const updated = await updateOccurrence(created.id, {
    ...basePayload(TOMBO_A),
    destinoFinal: "soltura",
    dataSaida: "2026-08-10",
    observacoes: "Solto após reabilitação",
  });
  assert.equal(updated.success, true);
  const afterUpdate = await getOccurrence(created.id);
  assert.equal(afterUpdate?.destinoFinal, "soltura");
  assert.equal(afterUpdate?.observacoes, "Solto após reabilitação");
  console.log("1/2 OK: updateOccurrence persiste as alterações");

  // 2. Duplicidade de tomboIma também é tratada na atualização
  const other = await createOccurrence(basePayload(TOMBO_B));
  if (!other.success) throw new Error("falha ao criar segundo registro");

  const duplicate = await updateOccurrence(other.id, {
    ...basePayload(TOMBO_A), // tomboIma já usado pelo primeiro registro
  });
  assert.equal(duplicate.success, false);
  assert.ok(!duplicate.success && duplicate.errors.tomboIma);
  console.log("2/2 OK: updateOccurrence detecta tomboIma duplicado");

  await cleanup();
  await prisma.$disconnect();
  console.log("OK: updateOccurrence validado contra o banco real.");
}

main().catch(async (error) => {
  console.error(error);
  await cleanup();
  process.exit(1);
});
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `npx tsx scripts/verify-update-occurrence.ts`
Expected: erro `has no exported member named 'updateOccurrence'`.

- [ ] **Step 3: Refatorar `occurrence.ts` — extrair `persistOccurrence` e adicionar `updateOccurrence`**

Substituir o corpo do arquivo a partir de `export type CreateOccurrenceResult` até o final por:

```typescript
export type CreateOccurrenceResult =
  | { success: true; id: string }
  | { success: false; errors: Record<string, string> };

async function persistOccurrence(
  values: OccurrenceFormValues,
  persist: (data: Prisma.OccurrenceCreateInput) => Promise<{ id: string }>
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
    const occurrence = await persist(data);
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

export async function createOccurrence(
  values: OccurrenceFormValues
): Promise<CreateOccurrenceResult> {
  return persistOccurrence(values, (data) => prisma.occurrence.create({ data }));
}

export async function updateOccurrence(
  id: string,
  values: OccurrenceFormValues
): Promise<CreateOccurrenceResult> {
  return persistOccurrence(values, (data) =>
    prisma.occurrence.update({ where: { id }, data })
  );
}
```

O topo do arquivo (os imports de `"use server"` até `toOccurrenceCreateInput`) não muda.

- [ ] **Step 4: Rodar de novo e confirmar que passa**

Run: `npx tsx scripts/verify-update-occurrence.ts`
Expected: as 2 linhas `OK` e `OK: updateOccurrence validado contra o banco real.`

- [ ] **Step 5: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/lib/actions/occurrence.ts scripts/verify-update-occurrence.ts
git commit -m "feat: add updateOccurrence server action"
```

---

### Task 7: Acordeão (`OccurrenceSections`) e modo de criação/edição no formulário

**Files:**
- Create: `src/components/forms/occurrence-sections.tsx`
- Modify: `src/components/forms/occurrence-form.tsx`
- Modify: `src/components/forms/sections/identification-section.tsx` (remover legend)
- Modify: `src/components/forms/sections/triage-section.tsx` (remover legend)
- Modify: `src/components/forms/sections/classification-section.tsx` (remover legend)
- Modify: `src/components/forms/sections/clinical-evaluation-section.tsx` (remover legend)
- Modify: `src/components/forms/sections/necropsy-section.tsx` (remover legend)
- Modify: `src/components/forms/sections/complementary-exams-section.tsx` (remover legend)
- Modify: `src/components/forms/sections/case-outcome-section.tsx` (remover legend)
- Test: `src/app/scratch-edit-test/page.tsx` (temporário — removido no fim da task)

**Interfaces:**
- Consumes: `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent` (Task 3), `useEffectSkipFirst` (Task 1), `createOccurrence`/`updateOccurrence` (Task 6), `toOccurrenceFormValues` (Task 4, usado só no teste desta task).
- Produces: `OccurrenceSections` (default export de `src/components/forms/occurrence-sections.tsx`) e `OccurrenceForm` agora aceitando `{ initialValues?: OccurrenceFormValues; occurrenceId?: string }` — usados pelas Tasks 8 e 9.

**Contexto:** esta task junta duas mudanças que mexem nos mesmos arquivos e por isso saem juntas: (1) trocar os 7 blocos empilhados por um acordeão com badges de situação, e (2) fazer `OccurrenceForm` funcionar tanto para criar quanto para editar. Com as duas juntas, o teste de integração desta task já cobre o cenário mais importante do projeto inteiro: abrir um registro salvo e confirmar que nada se perde.

- [ ] **Step 1: Remover a `legend` (e a numeração) das 7 seções**

Em cada arquivo, o `<fieldset>` de abertura muda de `className="rounded-lg border p-4"` para sem `className`, o bloco `<legend>...</legend>` é removido, e a `<div>` logo abaixo perde o `pt-6` do final da className (o espaçamento agora vem do `AccordionContent`, que já aplica `pb-4`).

`src/components/forms/sections/identification-section.tsx` — substituir:

```typescript
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        1. Identificação e local da ocorrência
      </legend>
      <div className="space-y-6 pt-6">
```

Por:

```typescript
    <fieldset>
      <div className="space-y-6">
```

`src/components/forms/sections/triage-section.tsx` — substituir:

```typescript
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        2. Triagem e status do animal
      </legend>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6">
```

Por:

```typescript
    <fieldset>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
```

`src/components/forms/sections/classification-section.tsx` — substituir:

```typescript
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        3. Classificação biológica
      </legend>
      <div className="flex flex-col gap-6 pt-6">
```

Por:

```typescript
    <fieldset>
      <div className="flex flex-col gap-6">
```

`src/components/forms/sections/clinical-evaluation-section.tsx` — substituir:

```typescript
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        4. Avaliação Clínica e Biometria
      </legend>
      <div className="space-y-6 pt-6">
```

Por:

```typescript
    <fieldset>
      <div className="space-y-6">
```

`src/components/forms/sections/necropsy-section.tsx` — substituir:

```typescript
    <fieldset className="rounded-lg border p-4" disabled={!isEnabled}>
      <legend className="-ml-1 px-1 text-lg font-medium">
        5. Dados de Necropsia (Animal Morto)
      </legend>
      <div className={`space-y-6 pt-6 ${!isEnabled ? "opacity-50" : ""}`}>
```

Por:

```typescript
    <fieldset disabled={!isEnabled}>
      <div className={`space-y-6 ${!isEnabled ? "opacity-50" : ""}`}>
```

`src/components/forms/sections/complementary-exams-section.tsx` — substituir:

```typescript
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        6. Resultados de Exames Complementares (Opcional)
      </legend>
      <div className="space-y-6 pt-6">
```

Por:

```typescript
    <fieldset>
      <div className="space-y-6">
```

`src/components/forms/sections/case-outcome-section.tsx` — substituir:

```typescript
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        7. Desfecho do Caso (Opcional)
      </legend>
      <div className="space-y-6 pt-6">
```

Por:

```typescript
    <fieldset>
      <div className="space-y-6">
```

Em todos os 7 arquivos, o `</div></fieldset>` de fechamento no final **não muda** — só a tag de abertura e a legend saem.

- [ ] **Step 2: Criar `occurrence-sections.tsx`**

```typescript
// src/components/forms/occurrence-sections.tsx
"use client";

import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

import IdentificationSection from "./sections/identification-section";
import TriageSection from "./sections/triage-section";
import ClassificationSection from "./sections/classification-section";
import ClinicalEvaluationSection from "./sections/clinical-evaluation-section";
import NecropsySection from "./sections/necropsy-section";
import ComplementaryExamsSection from "./sections/complementary-exams-section";
import CaseOutcomeSection from "./sections/case-outcome-section";

interface OccurrenceSectionsProps {
  control: Control<OccurrenceFormValues>;
  setFormValue: UseFormSetValue<OccurrenceFormValues>;
}

type SectionStatus = "completo" | "pendente" | "opcional" | "naoAplicavel";

const STATUS_CONFIG: Record<
  SectionStatus,
  { label: string; className: string }
> = {
  completo: { label: "Completo", className: "bg-emerald-100 text-emerald-800" },
  pendente: {
    label: "Obrigatório pendente",
    className: "bg-amber-100 text-amber-800",
  },
  opcional: { label: "Opcional", className: "bg-slate-100 text-slate-700" },
  naoAplicavel: {
    label: "Não aplicável",
    className: "bg-slate-100 text-slate-400",
  },
};

function SectionBadge({ status }: { status: SectionStatus }) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

function isIdentificationComplete(values: OccurrenceFormValues): boolean {
  return Boolean(
    values.tomboIma &&
      values.responsavelRegistro &&
      values.dataOcorrencia &&
      values.horarioColeta &&
      values.uf &&
      values.municipio &&
      values.localEspecifico &&
      values.latitude &&
      values.longitude
  );
}

function isTriagemComplete(values: OccurrenceFormValues): boolean {
  return Boolean(
    values.tipoEntrada &&
      values.statusAnimal &&
      values.classificacaoOcorrencia &&
      values.interacaoPesca &&
      (values.interacaoPesca !== "Sim" || values.interacaoPescaDescricao)
  );
}

function isClassificacaoComplete(values: OccurrenceFormValues): boolean {
  return Boolean(
    values.classe &&
      values.ordem &&
      values.familia &&
      values.genero &&
      values.especie &&
      values.sexo &&
      values.faixaEtaria
  );
}

const OccurrenceSections = ({
  control,
  setFormValue,
}: OccurrenceSectionsProps) => {
  const watchedValues = useWatch({ control }) as OccurrenceFormValues;

  const identificacaoStatus: SectionStatus = isIdentificationComplete(
    watchedValues
  )
    ? "completo"
    : "pendente";
  const triagemStatus: SectionStatus = isTriagemComplete(watchedValues)
    ? "completo"
    : "pendente";
  const classificacaoStatus: SectionStatus = isClassificacaoComplete(
    watchedValues
  )
    ? "completo"
    : "pendente";
  const necropsiaStatus: SectionStatus =
    watchedValues.statusAnimal === "Morto" ? "opcional" : "naoAplicavel";

  return (
    <Accordion
      type="multiple"
      defaultValue={["identificacao", "triagem", "classificacao"]}
      className="space-y-4"
    >
      <AccordionItem value="identificacao" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Identificação
            <SectionBadge status={identificacaoStatus} />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <IdentificationSection
            control={control}
            watchedUf={watchedValues.uf}
            setFormValue={setFormValue}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="triagem" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Triagem e status
            <SectionBadge status={triagemStatus} />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <TriageSection
            control={control}
            watchedStatusAnimal={watchedValues.statusAnimal}
            watchedInteracaoPesca={watchedValues.interacaoPesca}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="classificacao" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Classificação biológica
            <SectionBadge status={classificacaoStatus} />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ClassificationSection
            control={control}
            setFormValue={setFormValue}
            watchedClasse={watchedValues.classe}
            watchedOrdem={watchedValues.ordem}
            watchedFamilia={watchedValues.familia}
            watchedGenero={watchedValues.genero}
            watchedEspecie={watchedValues.especie}
          />
        </AccordionContent>
      </AccordionItem>

      <div className="pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Preencha agora ou depois, conforme o caso evolui
      </div>

      <AccordionItem value="clinica" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Avaliação clínica
            <SectionBadge status="opcional" />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ClinicalEvaluationSection
            control={control}
            watchedClasse={watchedValues.classe}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="necropsia" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Necropsia
            <SectionBadge status={necropsiaStatus} />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <NecropsySection
            control={control}
            watchedStatusAnimal={watchedValues.statusAnimal}
            watchedPresencaTumores={watchedValues.presencaTumores}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="exames" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Exames complementares
            <SectionBadge status="opcional" />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ComplementaryExamsSection control={control} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="desfecho" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Desfecho do caso
            <SectionBadge status="opcional" />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <CaseOutcomeSection
            control={control}
            watchedDestinoFinal={watchedValues.destinoFinal}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default OccurrenceSections;
```

- [ ] **Step 3: Reescrever `occurrence-form.tsx` por completo**

```typescript
// src/components/forms/occurrence-form.tsx
"use client";

import { useTransition } from "react";
import { useForm, SubmitHandler, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import OccurrenceSections from "./occurrence-sections";

import {
  formSchema,
  OccurrenceFormValues,
} from "@/lib/schemas/occurrenceSchema";
import { createOccurrence, updateOccurrence } from "@/lib/actions/occurrence";
import { useEffectSkipFirst } from "@/hooks/use-effect-skip-first";

const DEFAULT_VALUES: DefaultValues<OccurrenceFormValues> = {
  // 1. Identificação
  tomboIma: "",
  responsavelRegistro: "",
  dataOcorrencia: "",
  horarioColeta: "",
  uf: "",
  municipio: "",
  localEspecifico: "",
  latitude: "",
  longitude: "",
  nomeFoto: "",

  // 2. Triagem
  tipoEntrada: undefined,
  statusAnimal: undefined,
  classificacaoOcorrencia: undefined,
  codeDecomposicao: 1,
  interacaoPesca: undefined,
  interacaoPescaDescricao: "",

  // 3. Classificação
  classe: undefined,
  ordem: "",
  familia: "",
  genero: "",
  especie: "",
  nomeComum: "",
  sexo: undefined,
  faixaEtaria: undefined,
  anilhaNumero: "",

  // 4. Clínica
  pesoEntradaG: undefined,
  pesoEntradaGUnidade: undefined,
  condicaoCorporal: undefined,
  procedimentosClinicos: "",
  amostrasAntemortem: "",
  biometriaCt: undefined,
  biometriaCtUnidade: undefined,
  biometriaCompBico: undefined,
  biometriaBicoUnidade: undefined,
  biometriaCcc: undefined,
  biometriaCccUnidade: undefined,
  biometriaLcc: undefined,
  biometriaLccUnidade: undefined,

  // 5. Necropsia
  responsavelNecropsia: "",
  dataObito: "",
  achadosNecropsia: "",
  presencaTumores: undefined,
  descricaoTumores: "",
  causaMortisDiagnostico: "",
  causaMortisCategoria: undefined,
  amostrasPostmortem: "",

  // 6. Exames
  resultadoRadiografia: "",
  resultadoToxicologico: "",
  resultadoHistopatologico: "",
  achadosBioquimica: "",
  achadosHemograma: "",
  achadosFezesUrina: "",
  resultadoMicrobiologico: "",

  // 7. Desfecho
  pesoFinal: undefined,
  pesoFinalUnidade: undefined,
  dataSaida: "",
  destinoFinal: undefined,
  outroDestinoEspecificar: "",
  observacoes: "",
};

interface OccurrenceFormProps {
  initialValues?: OccurrenceFormValues;
  occurrenceId?: string;
}

export function OccurrenceForm({
  initialValues,
  occurrenceId,
}: OccurrenceFormProps) {
  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? DEFAULT_VALUES,
  });

  const watchedStatusAnimal = form.watch("statusAnimal");
  const watchedClasse = form.watch("classe");
  const watchedInteracaoPesca = form.watch("interacaoPesca");

  const { setValue, clearErrors } = form;

  const [isPending, startTransition] = useTransition();

  // Lógica do CODE
  useEffectSkipFirst(() => {
    if (watchedStatusAnimal === "Vivo") {
      setValue("codeDecomposicao", 1);
      clearErrors("codeDecomposicao");
    } else if (watchedStatusAnimal === "Morto") {
      setValue("codeDecomposicao", 0); // 0 força erro no Zod (min 1/2), obrigando escolha
    }
  }, [watchedStatusAnimal, setValue, clearErrors]);

  // Limpeza de campos condicionais
  useEffectSkipFirst(() => {
    if (watchedStatusAnimal === "Vivo") {
      setValue("responsavelNecropsia", "");
      setValue("dataObito", "");
      setValue("achadosNecropsia", "");
      setValue("presencaTumores", undefined);
      setValue("descricaoTumores", "");
      setValue("causaMortisDiagnostico", "");
      setValue("causaMortisCategoria", undefined);
      setValue("amostrasPostmortem", "");
      clearErrors();
    }
  }, [watchedStatusAnimal, setValue, clearErrors]);

  useEffectSkipFirst(() => {
    if (watchedInteracaoPesca === "Nao") {
      setValue("interacaoPescaDescricao", "");
      clearErrors("interacaoPescaDescricao");
    }
  }, [watchedInteracaoPesca, setValue, clearErrors]);

  useEffectSkipFirst(() => {
    if (watchedClasse !== "Aves" && watchedClasse !== "Reptilia") {
      setValue("anilhaNumero", "");
      clearErrors("anilhaNumero");
    }
  }, [watchedClasse, setValue, clearErrors]);

  const onSubmit: SubmitHandler<OccurrenceFormValues> = (data) => {
    startTransition(async () => {
      try {
        const result = occurrenceId
          ? await updateOccurrence(occurrenceId, data)
          : await createOccurrence(data);

        if (!result.success) {
          Object.entries(result.errors).forEach(([field, message]) => {
            form.setError(field as keyof OccurrenceFormValues, { message });
          });
          toast.error("Não foi possível salvar o registro.", {
            description: "Verifique os campos indicados no formulário.",
          });
          return;
        }

        toast.success(
          occurrenceId
            ? "Registro atualizado com sucesso!"
            : "Formulário enviado com sucesso!",
          {
            description: `O registro ${data.tomboIma} foi salvo (ID: ${result.id}).`,
            duration: 5000,
          }
        );
        if (!occurrenceId) {
          form.reset();
        }
      } catch {
        toast.error("Ocorreu um erro inesperado ao salvar o registro.", {
          description: "Tente novamente em instantes.",
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <OccurrenceSections control={form.control} setFormValue={setValue} />
        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-button-primary-bg text-brand-button-primary-fg hover:bg-brand-button-primary-bg/90"
        >
          {isPending
            ? "Enviando..."
            : occurrenceId
              ? "Salvar alterações"
              : "Enviar Formulário"}
        </Button>
      </form>
    </Form>
  );
}
```

- [ ] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 5: Teste de integração — criar um registro real, abrir em modo edição, confirmar que nada se perde**

Este é o teste mais importante do plano inteiro: ele prova que a correção da Task 1 funciona de verdade com dados reais vindos do banco.

Create: `scratch-seed.mts` (na raiz do projeto, script temporário)

```typescript
import "dotenv/config";
import { prisma } from "./src/lib/prisma";
import { createOccurrence } from "./src/lib/actions/occurrence";
import type { OccurrenceFormValues } from "./src/lib/schemas/occurrenceSchema";

const TOMBO = "IMA77701";

async function main() {
  await prisma.occurrence.deleteMany({ where: { tomboIma: TOMBO } });

  const payload: OccurrenceFormValues = {
    tomboIma: TOMBO,
    responsavelRegistro: "Script de Seed",
    dataOcorrencia: "2026-08-09",
    horarioColeta: "14:30",
    uf: "PA",
    municipio: "Belém",
    localEspecifico: "Praia Teste",
    latitude: "-1.4558",
    longitude: "-48.4902",
    nomeFoto: "",
    tipoEntrada: "Entrega voluntária",
    statusAnimal: "Morto",
    classificacaoOcorrencia: "Resgate e Reabilitação",
    codeDecomposicao: 2,
    interacaoPesca: "Sim",
    interacaoPescaDescricao: "Encontrado em rede de pesca",
    classe: "Mammalia",
    ordem: "Sirenia",
    familia: "Trichechidae",
    genero: "Trichechus",
    especie: "Trichechus inunguis",
    nomeComum: "Peixe-boi da Amazônia",
    sexo: "F",
    faixaEtaria: "adulto",
    pesoEntradaG: 45,
    pesoEntradaGUnidade: "kg",
    condicaoCorporal: "péssima",
    biometriaCompBico: 12.5,
    biometriaBicoUnidade: "cm",
  };

  const result = await createOccurrence(payload);
  if (!result.success) {
    console.error("FALHOU:", result.errors);
    process.exit(1);
  }
  console.log("ID:", result.id);
  await prisma.$disconnect();
}

main();
```

Run: `npx tsx scratch-seed.mts`
Expected: imprime `ID: <algum id>` sem erro (isso já prova que um animal Morto sem necropsia salva — Task 2).

Create: `src/app/scratch-edit-test/page.tsx` (temporário)

```typescript
import { prisma } from "@/lib/prisma";
import { toOccurrenceFormValues } from "@/lib/actions/occurrence-mappers";
import { OccurrenceForm } from "@/components/forms/occurrence-form";

export default async function ScratchEditTest() {
  const occurrence = await prisma.occurrence.findUniqueOrThrow({
    where: { tomboIma: "IMA77701" },
  });
  const initialValues = toOccurrenceFormValues(occurrence);

  return (
    <div className="container mx-auto px-4 py-12">
      <OccurrenceForm initialValues={initialValues} occurrenceId={occurrence.id} />
    </div>
  );
}
```

Run: `npm run dev` (em background)
Run: `curl -s -o /tmp/edit-test.html http://localhost:3000/scratch-edit-test`

Run: `grep -o "Trichechus inunguis\|Sirenia\|Trichechidae\|Trichechus<\|IMA77701" /tmp/edit-test.html | sort -u`
Expected: todas as 5 linhas aparecem — isso confirma que a classe/ordem/família/gênero/espécie carregados do banco **não foram apagados** pelos efeitos de cascata ao montar a tela.

Run: `grep -o '\\"codeDecomposicao\\":[0-9]*' /tmp/edit-test.html`
Expected: `\"codeDecomposicao\":2` — confirma que o CODE real (2, de um animal Morto) não foi zerado pelo efeito de status.

Run: `grep -o "Completo\|Identificação\|Classificação biológica\|Preencha agora ou depois" /tmp/edit-test.html | sort -u`
Expected: as 4 linhas aparecem — confirma o acordeão renderizado com badges de situação calculados a partir dos dados carregados.

Pare o servidor (`pkill -f "next dev"`), apague os arquivos temporários e o registro de teste:

Run:
```bash
rm -f scratch-seed.mts
rm -rf src/app/scratch-edit-test
npx tsx -e "
import 'dotenv/config';
import { prisma } from './src/lib/prisma';
async function main() {
  await prisma.occurrence.deleteMany({ where: { tomboIma: 'IMA77701' } });
  await prisma.\$disconnect();
}
main();
"
```

- [ ] **Step 6: Commit**

```bash
git add src/components/forms/occurrence-sections.tsx src/components/forms/occurrence-form.tsx src/components/forms/sections/identification-section.tsx src/components/forms/sections/triage-section.tsx src/components/forms/sections/classification-section.tsx src/components/forms/sections/clinical-evaluation-section.tsx src/components/forms/sections/necropsy-section.tsx src/components/forms/sections/complementary-exams-section.tsx src/components/forms/sections/case-outcome-section.tsx
git commit -m "feat: accordion layout with section status badges, create/edit mode support"
```

---

### Task 8: Rotas de criação e edição

**Files:**
- Create: `src/app/registros/novo/page.tsx`
- Create: `src/app/registros/[id]/page.tsx`

**Interfaces:**
- Consumes: `OccurrenceForm` (Task 7), `getOccurrence` (Task 5), `toOccurrenceFormValues` (Task 4).
- Produces: as rotas `/registros/novo` e `/registros/[id]` — consumidas pela Task 9 (links da listagem).

- [ ] **Step 1: Criar a rota de criação**

```typescript
// src/app/registros/novo/page.tsx
import { OccurrenceForm } from "@/components/forms/occurrence-form";

export default function NovoRegistroPage() {
  return (
    <>
      <div className="sticky top-20 md:top-24 z-40 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto flex h-14 items-center px-4">
          <h1 className="text-xl font-bold tracking-tight text-brand-title-bar-fg">
            Novo Registro
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="bg-card p-6 md:p-8 rounded-lg border shadow-md">
          <OccurrenceForm />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Criar a rota de edição**

```typescript
// src/app/registros/[id]/page.tsx
import { notFound } from "next/navigation";
import { getOccurrence } from "@/lib/actions/occurrence-queries";
import { toOccurrenceFormValues } from "@/lib/actions/occurrence-mappers";
import { OccurrenceForm } from "@/components/forms/occurrence-form";

export default async function EditarRegistroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const occurrence = await getOccurrence(id);

  if (!occurrence) {
    notFound();
  }

  const initialValues = toOccurrenceFormValues(occurrence);

  return (
    <>
      <div className="sticky top-20 md:top-24 z-40 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto flex h-14 items-center px-4">
          <h1 className="text-xl font-bold tracking-tight text-brand-title-bar-fg">
            Editar Registro — {occurrence.tomboIma}
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="bg-card p-6 md:p-8 rounded-lg border shadow-md">
          <OccurrenceForm
            initialValues={initialValues}
            occurrenceId={occurrence.id}
          />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Verificação manual no navegador**

Run: `npm run dev` (em background)

Run: `curl -s -o /tmp/novo.html -w "HTTP %{http_code}\n" http://localhost:3000/registros/novo`
Expected: `HTTP 200`

Run: `curl -s -o /tmp/inexistente.html -w "HTTP %{http_code}\n" http://localhost:3000/registros/id-que-nao-existe`
Expected: `HTTP 404` (a página chama `notFound()`).

Run: crie um registro real (reaproveite o `createOccurrence` via um script `tsx -e` inline, ou use a UI em `/registros/novo`), pegue o `id` retornado, e confirme:

Run: `curl -s -o /tmp/editar.html -w "HTTP %{http_code}\n" http://localhost:3000/registros/<id-real>`
Expected: `HTTP 200`, e `grep -o "Editar Registro" /tmp/editar.html` encontra o título.

Limpe o registro de teste criado e pare o servidor (`pkill -f "next dev"`).

- [ ] **Step 5: Commit**

```bash
git add src/app/registros
git commit -m "feat: add create and edit routes for occurrence records"
```

---

### Task 9: Listagem de registros (home)

**Files:**
- Create: `src/components/registros/occurrence-list.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `listOccurrences`, `OccurrenceListItem`, `OccurrenceSituacao` (Task 5).
- Produces: nenhuma — é a ponta final do fluxo, consumida pelo usuário.

- [ ] **Step 1: Criar o componente de listagem**

```typescript
// src/components/registros/occurrence-list.tsx
import Link from "next/link";
import type {
  OccurrenceListItem,
  OccurrenceSituacao,
} from "@/lib/actions/occurrence-queries";

interface OccurrenceListProps {
  occurrences: OccurrenceListItem[];
  situacao: OccurrenceSituacao;
  busca: string;
}

const TABS: { value: OccurrenceSituacao; label: string }[] = [
  { value: "aberto", label: "Em aberto" },
  { value: "encerrado", label: "Encerrados" },
  { value: "todos", label: "Todos" },
];

function formatDate(date: Date): string {
  // A data é armazenada como @db.Date (UTC, sem hora) — forçar timeZone
  // "UTC" aqui é obrigatório, senão o dia exibido pode ficar um dia
  // atrasado dependendo do fuso do navegador/servidor.
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function OccurrenceList({
  occurrences,
  situacao,
  busca,
}: OccurrenceListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/?situacao=${tab.value}${
              busca ? `&busca=${encodeURIComponent(busca)}` : ""
            }`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              situacao === tab.value
                ? "bg-brand-button-primary-bg text-brand-button-primary-fg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form method="get" className="flex gap-2">
        <input type="hidden" name="situacao" value={situacao} />
        <input
          type="text"
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por tombo, espécie ou município..."
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-button-primary-bg px-4 py-2 text-sm font-medium text-brand-button-primary-fg"
        >
          Buscar
        </button>
      </form>

      {occurrences.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          Nenhum registro encontrado.
        </p>
      ) : (
        <div className="divide-y rounded-lg border">
          {occurrences.map((occurrence) => (
            <Link
              key={occurrence.id}
              href={`/registros/${occurrence.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="font-medium">{occurrence.tomboIma}</span>
                <span className="truncate text-sm italic text-muted-foreground">
                  {occurrence.especie}
                </span>
              </div>
              <span className="shrink-0 text-sm text-muted-foreground">
                {formatDate(occurrence.dataOcorrencia)}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  occurrence.destinoFinal
                    ? "bg-slate-100 text-slate-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {occurrence.destinoFinal ? "Encerrado" : "Em aberto"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Reescrever `src/app/page.tsx`**

```typescript
// src/app/page.tsx
import Link from "next/link";
import {
  listOccurrences,
  type OccurrenceSituacao,
} from "@/lib/actions/occurrence-queries";
import { OccurrenceList } from "@/components/registros/occurrence-list";

function parseSituacao(value: string | undefined): OccurrenceSituacao {
  if (value === "aberto" || value === "encerrado" || value === "todos") {
    return value;
  }
  return "aberto";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ situacao?: string; busca?: string }>;
}) {
  const params = await searchParams;
  const situacao = parseSituacao(params.situacao);
  const busca = params.busca ?? "";

  const occurrences = await listOccurrences({
    situacao,
    busca: busca || undefined,
  });

  return (
    <>
      <div className="sticky top-20 md:top-24 z-40 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-xl font-bold tracking-tight text-brand-title-bar-fg">
            Registros de Ocorrência
          </h1>
          <Link
            href="/registros/novo"
            className="rounded-md bg-brand-button-primary-bg px-4 py-2 text-sm font-medium text-brand-button-primary-fg hover:bg-brand-button-primary-bg/90"
          >
            Novo Registro
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <OccurrenceList
          occurrences={occurrences}
          situacao={situacao}
          busca={busca}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 3: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 4: Verificação manual — popular alguns registros e conferir abas/busca**

Run: `npm run dev` (em background)

Crie 2-3 registros reais pela UI (`/registros/novo`), pelo menos um com `destinoFinal` preenchido (para virar "Encerrado") e ao menos um sem.

Run: `curl -s -o /tmp/home.html http://localhost:3000/`
Run: `grep -o "Em aberto\|Encerrados\|Todos\|Novo Registro" /tmp/home.html | sort -u`
Expected: as 4 linhas aparecem.

Abra `http://localhost:3000/` no fluxo esperado: confirme visualmente (ou via curl com `?situacao=encerrado`) que o registro com desfecho aparece só na aba "Encerrados", e o(s) outro(s) só em "Em aberto". Teste a busca digitando parte do nome de uma espécie.

Limpe os registros de teste criados nesta verificação (via Prisma Studio — `npm run db:studio` — ou um script `tsx -e` com `prisma.occurrence.deleteMany`). Pare o servidor (`pkill -f "next dev"`).

- [ ] **Step 5: Commit**

```bash
git add src/components/registros/occurrence-list.tsx src/app/page.tsx
git commit -m "feat: rewrite home page as occurrence listing with tabs and search"
```

---

## Depois deste plano

- Autenticação (Clerk) e papéis/permissões — projeto separado já identificado, incluindo quem pode editar/apagar o quê.
- Exclusão de registros (depende do modelo de permissões).
- Salvamento automático de rascunho local / funcionamento offline — avaliado e descartado nesta rodada.
- Upload real de foto.
- Paginação da listagem, se o volume de registros justificar.
- Confirmar com o instituto se existe uma ficha oficial em papel numerada — se existir, revisitar a decisão de remover a numeração das seções.
