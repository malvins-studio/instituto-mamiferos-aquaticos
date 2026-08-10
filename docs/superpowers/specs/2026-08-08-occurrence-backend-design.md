# Backend de Persistência de Ocorrências (SIIMA)

Data: 2026-08-08
Status: Implementado (branch `feat/occurrence-backend`)

> **Atualização (2026-08-09):** a decisão original de usar Postgres local
> via Docker foi revisada após dificuldades de acesso ao Docker no ambiente
> de desenvolvimento. O projeto passou a usar **Supabase** (Postgres
> gerenciado) tanto em desenvolvimento quanto, futuramente, em produção —
> substituindo a opção original (Neon) cogitada no stack inicial. As seções
> "Arquitetura" e "Conexão com o banco" abaixo já refletem essa decisão.

## Contexto

O formulário de ocorrência (`src/components/forms/occurrence-form.tsx`) e sua
validação (`src/lib/schemas/occurrenceSchema.ts`) já estão prontos e são a
fonte da verdade dos dados que precisam ser persistidos. Hoje o `onSubmit`
apenas loga no console e mostra um toast — não existe nenhuma camada de
backend (sem Prisma, sem driver de banco, sem Server Action).

A taxonomia (classe/ordem/família/gênero/espécie) vem de um JSON estático
(`src/data/species-data.json`) consultado em cascata no client — não é uma
tabela do banco.

## Escopo desta rodada

Dentro do escopo:
- Modelo Prisma para a tabela de ocorrências.
- Conexão com Postgres gerenciado (Supabase) via Prisma.
- Server Action que valida (novamente, no servidor) e persiste o payload do
  formulário.
- Integração do `onSubmit` do formulário com a Server Action, incluindo
  exibição de erros de validação vindos do servidor.

Fora de escopo (ficam para rodadas futuras):
- Autenticação/Clerk (nenhuma tabela `User`, nenhuma sessão).
- Multi-tenancy (sem `Organization`/`organizationId` — instância única do
  IMA).
- Upload real de arquivo/foto (`nomeFoto` continua sendo apenas uma string;
  Supabase Storage é a opção mais provável quando isso entrar em escopo).
- Testes automatizados (não há Jest/Vitest configurado no projeto).
- Telas de listagem/edição de ocorrências (só criação, via o form existente).

## Arquitetura

- **ORM**: Prisma, contra Postgres gerenciado (Supabase), tanto em
  desenvolvimento quanto em produção — sem Postgres local.
- **Modelo**: uma única tabela `Occurrence`, espelhando 1:1 o `formSchema`
  do Zod (um objeto plano com ~60 campos, a maioria nullable nas seções
  clínica/necropsia/exames/desfecho — igual ao Zod já trata como opcional).
  Optou-se por não normalizar em tabelas por seção nesta rodada: não há
  hoje necessidade de consultar/editar seções independentemente, e uma
  tabela única evita nested writes e joins desnecessários. Pode ser
  revisitado se surgir essa necessidade.
- **Enums**: campos de opções fechadas (status, classe, sexo, unidades,
  destino final, etc.) viram `enum` nativos do Prisma/Postgres, com
  identificadores limpos (ex.: `ENTREGA_VOLUNTARIA`) — a Server Action é
  responsável por mapear o valor vindo do Zod (que às vezes tem acentos,
  espaços ou casing inconsistente) para o identificador do enum.
- **Escrita**: uma única Server Action (`"use server"`) é o único ponto de
  entrada de escrita. Revalida o payload inteiro com o mesmo `formSchema`
  no servidor (nunca confia apenas na validação do client).

## Modelo de dados

Tabela `Occurrence`, campos por seção (nomes e tipos Zod entre parênteses
quando relevante):

**Identificação**
- `id` — cuid, chave primária.
- `tomboIma` (string, regex `IMA\d{5}`) — `String @unique`.
- `responsavelRegistro` (string) — `String`.
- `dataOcorrencia` (string) — `DateTime`.
- `horarioColeta` (string "HH:mm") — `String` (mantido como texto simples;
  combinar com `dataOcorrencia` num único `DateTime` traria complexidade de
  timezone sem benefício claro agora).
- `uf`, `municipio`, `localEspecifico` — `String`.
- `latitude`, `longitude` (string no Zod) — `Float` no banco. A Server
  Action valida que o valor é numérico antes de converter (o Zod atual
  aceita qualquer string não vazia); se não for numérico, retorna erro de
  campo em vez de falhar silenciosamente.
- `nomeFoto` (string opcional) — `String?`.

**Triagem**
- `tipoEntrada`, `statusAnimal`, `classificacaoOcorrencia` — enums.
- `codeDecomposicao` (number 1–5) — `Int`.
- `interacaoPesca` (Zod: `"Sim"/"Nao"`) — enum `SimNao` (mesmo enum usado
  por `presencaTumores`, que no Zod é `"sim"/"nao"` — a Server Action
  normaliza os dois para os mesmos identificadores, corrigindo a
  inconsistência de casing existente no Zod sem precisar alterá-lo).
- `interacaoPescaDescricao` (opcional) — `String?`.

**Classificação biológica**
- `classe` — enum (`Amphibia`, `Aves`, `Elasmobranchii`, `Mammalia`,
  `Reptilia`).
- `ordem`, `familia`, `genero`, `especie` — `String` (texto livre, vêm do
  JSON estático de taxonomia, não de uma tabela relacional).
- `nomeComum` (opcional) — `String?`.
- `sexo` — enum (`M`, `F`, `IN`).
- `faixaEtaria` — enum (`feto`, `filhote`, `juvenil`, `subadulto`,
  `adulto`).
- `anilhaNumero` (opcional) — `String?`.

**Avaliação clínica** (todos opcionais)
- `pesoEntradaG` — `Float?`; `pesoEntradaGUnidade` — enum `UnidadePeso`
  (`g`, `kg`).
- `condicaoCorporal` — enum (`boa`, `regular`, `pessima`, mapeado de
  "péssima").
- `procedimentosClinicos`, `amostrasAntemortem` — `String? @db.Text`.
- Biometria: `biometriaCt`, `biometriaCompBico`, `biometriaCcc`,
  `biometriaLcc` — `Float?`, cada um com seu campo de unidade (`cm`, `mm`,
  `m` conforme o Zod já restringe por campo) como enum.

**Necropsia** (todos opcionais)
- `responsavelNecropsia` — `String?`.
- `dataObito` — `DateTime?`.
- `achadosNecropsia` — `String? @db.Text`.
- `presencaTumores` — enum `SimNao?`.
- `descricaoTumores` — `String? @db.Text`.
- `causaMortisDiagnostico` — `String? @db.Text`.
- `causaMortisCategoria` — enum (`Antropica`, `Patologica`, `Fisiologica`,
  `Desconhecida`, `Indeterminada`).
- `amostrasPostmortem` — `String? @db.Text`.

**Exames complementares** (todos opcionais, `String? @db.Text`)
- `resultadoRadiografia`, `resultadoToxicologico`,
  `resultadoHistopatologico`, `achadosBioquimica`, `achadosHemograma`,
  `achadosFezesUrina`, `resultadoMicrobiologico`.

**Desfecho do caso** (todos opcionais)
- `pesoFinal` — `Float?`; `pesoFinalUnidade` — enum `UnidadePeso?`.
- `dataSaida` — `DateTime?`.
- `destinoFinal` — enum (`soltura`, `transferencia`, `obito`,
  `colecao_cientifica`, `enterro`, `incineracao`, `maceracao`, `doacao`,
  `colecao_cientifica_ima`, `outro`).
- `outroDestinoEspecificar` — `String?`.
- `observacoes` — `String? @db.Text`.

**Metadados**
- `createdAt DateTime @default(now())`.
- `updatedAt DateTime @updatedAt`.

Regras de negócio do `superRefine` do Zod (code por status do animal,
necropsia obrigatória se morto, etc.) permanecem só na camada de validação
(Zod), não são modeladas como constraints do banco.

## Fluxo de dados (Server Action)

Arquivo: `src/lib/actions/occurrence.ts`.

1. Recebe o payload (tipo `OccurrenceFormValues`).
2. Revalida com `formSchema.safeParse` no servidor.
3. Se inválido → retorna `{ success: false, errors: Record<string, string> }`
   (formato compatível com `form.setError` do React Hook Form) — não usa
   `throw`.
4. Se válido → mapeia os valores do Zod para o formato do Prisma:
   - normaliza `interacaoPesca`/`presencaTumores` para o enum `SimNao`;
   - converte `latitude`/`longitude` para `Float` (com validação extra de
     "é numérico", retornando erro de campo se não for);
   - converte `dataOcorrencia`/`dataObito`/`dataSaida` de string para
     `Date`;
   - mapeia os demais enums (acentos/espaços) para os identificadores do
     Prisma.
5. Chama `prisma.occurrence.create()`.
6. Trata violação da constraint única de `tomboIma` (retorna erro
   amigável no campo `tomboIma` em vez de vazar o erro do Postgres).
7. Sucesso → retorna `{ success: true, id }`.

## Conexão com o banco

- Banco: um único projeto Supabase, usado tanto em desenvolvimento quanto
  em produção (sem Postgres local/Docker).
- `src/lib/prisma.ts`: singleton do `PrismaClient`, usando
  `@prisma/adapter-pg` (driver adapter — exigido pelo Prisma 7) apontando
  para a connection string **pooled** (`DATABASE_URL`, porta 6543, via
  Supavisor). Falha rápido (`throw`) se `DATABASE_URL` não estiver
  definida, em vez de cair silenciosamente em um Postgres local por
  padrão.
- `prisma.config.ts`: usado pela Prisma CLI (migrations, `db pull`,
  `studio`) apontando para a connection string **direta**
  (`DIRECT_URL`, porta 5432) — o pooler em modo transaction não suporta
  os comandos que `prisma migrate` precisa rodar.
- `.env` com `DATABASE_URL` (pooled) e `DIRECT_URL` (direta), ambas
  copiadas do painel do Supabase (Settings > Database > Connect);
  `.env.example` versionado com placeholders, sem credenciais reais.
- `prisma/schema.prisma` + primeira migration via `prisma migrate dev`.
- Novas dependências: `prisma`, `@prisma/client`, `@prisma/adapter-pg`,
  `pg`, `dotenv`.

## Integração no formulário

Em `occurrence-form.tsx`:
- `onSubmit` passa a chamar a Server Action dentro de um `useTransition`
  (estado de loading no botão de envio).
- Se a Server Action retornar `errors`, cada um é aplicado via
  `form.setError(campo, { message })`.
- Em caso de sucesso, mantém o toast de sucesso (`sonner`) — agora com o
  `id` real retornado — e reseta o formulário (`form.reset()`).

## Testes

Não há suíte de testes configurada no projeto. Critério de aceite desta
rodada é validação manual: rodar o formulário, submeter casos válidos e
inválidos (incluindo o de `tomboIma` duplicado), e conferir os dados no
Prisma Studio.

## Decisões registradas (para não revisitar sem motivo)

- Sem Clerk/auth nesta rodada.
- Single-tenant (sem `organizationId`).
- `nomeFoto` continua String simples, sem upload real.
- Supabase (Postgres gerenciado) para desenvolvimento e produção — sem
  Postgres local/Docker (decisão revisada em 2026-08-09; originalmente
  era Docker local nesta rodada, com Neon cogitado para produção).
- Tabela única `Occurrence`, não normalizada por seção.
- Enums nativos do Postgres para campos de opção fechada.
- Server Action normaliza a inconsistência `Sim/Nao` vs `sim/nao` do Zod.
- Server Action valida numericamente latitude/longitude antes de
  converter para `Float`.
