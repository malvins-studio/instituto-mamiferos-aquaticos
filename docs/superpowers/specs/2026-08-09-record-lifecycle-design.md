# Ciclo de Vida do Registro de Ocorrência (SIIMA)

Data: 2026-08-09
Status: Aprovado para planejamento
Branch: `feat/record-lifecycle` (a partir de `feat/occurrence-backend`)

## Contexto

O formulário de ocorrência hoje é uma página única com sete seções numeradas,
todas visíveis, preenchidas de uma vez e enviadas de uma vez. Não existe tela
de listagem nem forma de reabrir um registro salvo.

Isso não corresponde a como o trabalho acontece no Instituto Mamíferos
Aquáticos. O preenchimento ocorre em dois contextos — no campo (celular, com
o animal presente) e na base (desktop, transcrevendo) — e um registro pode
levar semanas para ficar completo:

- Ocorrências de **Coleta** e **Registro** normalmente se encerram no mesmo dia.
- **Resgate e Reabilitação** se estende por semanas ou meses: o animal é
  tratado, exames laboratoriais demoram a sair, e o desfecho (soltura, óbito,
  transferência) só se conhece no fim.

O formulário atual exige que tudo seja conhecido no momento do envio.

### O problema central

Há uma regra em `src/lib/schemas/occurrenceSchema.ts` que impede diretamente o
uso em campo:

```js
if (data.statusAnimal === "Morto") {
  if (!data.responsavelNecropsia) → obrigatório
  if (!data.dataObito)            → obrigatório
}
```

Marcar um animal como morto torna obrigatório informar o responsável pela
necropsia e a data do óbito. Mas a necropsia é feita depois, no instituto —
não na praia. Como está, o pesquisador que encontra um animal morto em campo
**não consegue salvar o registro**.

As seções 4 a 7 (Avaliação clínica, Necropsia, Exames complementares, Desfecho)
já são inteiramente opcionais no schema, com exceção dessa regra. Ou seja: um
registro contendo apenas as seções 1 a 3 já é válido hoje. O que falta não é
afrouxar validação — é poder reabrir o registro depois para continuar.

## Objetivo

Permitir que um registro nasça com o essencial e cresça ao longo do tempo,
servindo bem tanto ao preenchimento rápido em campo quanto ao preenchimento
completo de uma vez.

## Escopo

Dentro do escopo:

- Reestruturação do formulário em acordeão, com as seções essenciais
  destacadas e as demais recolhidas.
- Remoção da exigência de necropsia para salvar um animal morto.
- Remoção da numeração das seções.
- Tela de listagem de registros, com busca e separação entre casos em aberto e
  encerrados.
- Modo de edição: reabrir um registro existente e complementá-lo.
- Correção dos efeitos de cascata que apagam campos ao inicializar o
  formulário (detalhado abaixo — é pré-requisito para a edição funcionar).

Fora de escopo (rodadas futuras):

- **Autenticação, papéis e permissões** — projeto separado, já identificado.
  Inclui quem pode editar ou apagar o quê.
- **Exclusão de registros** — depende do modelo de permissões; ninguém apaga
  nada nesta rodada.
- **Funcionamento offline** (service worker, fila de sincronização) — decidido
  explicitamente como fora de escopo.
- **Salvamento automático de rascunho local** — idem.
- **Upload real de foto** — `nomeFoto` continua sendo apenas texto.
- **Paginação da listagem** — o volume esperado não justifica agora.

## Decisões tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Estrutura da tela | Acordeão (seções recolhíveis) | Serve celular e desktop com um só desenho; permite pular para qualquer seção, o que importa para quem transcreve ficha de papel |
| Momento de salvar | A qualquer momento, desde que as seções essenciais estejam completas | Corresponde ao fato de que o dado nasce em momentos diferentes |
| Mínimo para salvar | Seções 1 a 3 (Identificação, Triagem, Classificação) | Garante que todo registro no banco tenha valor científico; evita registros vazios |
| Numeração das seções | Removida | A ficha oficial em papel não é numerada, e com seções condicionais a numeração ficaria instável |
| Caso encerrado | Inferido de `destinoFinal` preenchido | Evita campo de status novo e um passo manual esquecível; o desfecho já responde a pergunta |
| Necropsia | Visível sempre, travada até `statusAnimal = "Morto"` | Esconder deixa o usuário sem saber que o campo existe; travar comunica o porquê |

## Estrutura do formulário

> Os números abaixo servem apenas para referência dentro deste documento. Na
> tela, nenhum bloco exibe numeração — ver a decisão correspondente acima.

Três blocos essenciais, destacados visualmente e abertos por padrão:

1. Identificação
2. Triagem e status
3. Classificação biológica

Sob um rótulo explícito (*"preencha agora ou depois, conforme o caso evolui"*),
quatro blocos recolhidos:

4. Avaliação clínica
5. Necropsia — travada, com o motivo escrito no bloco, até o animal ser
   marcado como morto
6. Exames complementares
7. Desfecho do caso

Cada bloco exibe um indicador de situação: completo, obrigatório pendente,
opcional, ou não aplicável.

Vários blocos podem ficar abertos ao mesmo tempo. Abrir um não fecha os
demais — quem transcreve uma ficha inteira precisa poder deixar tudo aberto e
percorrer de cima a baixo.

O botão de salvar fica sempre acessível, habilitado assim que os três blocos
essenciais estiverem válidos — não no fim de uma rolagem longa.

### Necropsia deixa de bloquear o envio

A regra do `superRefine` que torna `responsavelNecropsia` e `dataObito`
obrigatórios quando o animal está morto é **removida**. Ambos passam a ser
opcionais, como os demais campos da seção.

As outras regras condicionais do schema permanecem inalteradas: CODE de
decomposição por status do animal, descrição obrigatória quando há interação
com pesca, descrição obrigatória quando há tumores, e especificação obrigatória
quando o destino final é "outro".

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Listagem de registros (Server Component) |
| `/registros/novo` | Formulário de criação |
| `/registros/[id]` | Formulário de edição, carregado com o registro |

A home passa a ser a listagem: ao entrar no sistema, a primeira informação útil
é quais casos estão em aberto.

## Tela de listagem

- Três abas: **Em aberto**, **Encerrados**, **Todos**.
- Um caso conta como encerrado quando `destinoFinal` está preenchido.
- Busca por tombo IMA, espécie ou município.
- Cada linha mostra tombo, espécie, data da ocorrência e situação.
- Botão destacado de "Novo registro".

Aba e busca são resolvidas **no servidor**, via parâmetros de URL (por exemplo
`/?situacao=aberto&busca=trichechus`), traduzidos em cláusulas `where` do
Prisma. Isso mantém a listagem como Server Component, evita mandar a base
inteira para o navegador e torna cada filtro um endereço compartilhável.

Ordenação padrão: data da ocorrência decrescente (mais recentes primeiro).

## Correção obrigatória: efeitos de cascata

O formulário atual contém efeitos que limpam campos sempre que um valor do qual
dependem muda — **inclusive na primeira renderização**. Em
`classification-section.tsx`:

```js
useEffect(() => {
  setOrdens(ordensData);
  setFormValue("ordem", "");
  setFormValue("familia", "");
  setFormValue("genero", "");
  setFormValue("especie", "");
  setFormValue("nomeComum", "");
}, [watchedClasse, setFormValue]);
```

Ao abrir um registro salvo, a classe chega preenchida vinda do banco, o efeito
dispara na montagem e apaga ordem, família, gênero e espécie antes da tela
aparecer. O mesmo padrão existe em `occurrence-form.tsx`: o efeito do CODE zera
`codeDecomposicao` quando o animal está marcado como morto, e o efeito de
limpeza apaga os campos de necropsia quando o animal está vivo.

Esses efeitos foram escritos assumindo que o formulário sempre começa vazio,
o que era verdade até existir modo de edição. Precisam distinguir duas
situações:

- **O usuário mudou o valor** → limpar os campos dependentes (comportamento
  atual, correto).
- **O formulário foi inicializado com valores** → não tocar em nada.

Sem essa correção, abrir um registro para complementá-lo corrompe dados
silenciosamente — o pior tipo de falha para dados de pesquisa.

## Fluxo de dados

**Criação** (inalterado): formulário → `createOccurrence` → validação Zod no
servidor → mapeadores → `prisma.occurrence.create`.

**Leitura**: `src/lib/actions/occurrence-queries.ts` expõe `listOccurrences`
(com filtro de situação e busca) e `getOccurrence(id)`. Ambas são consumidas
por Server Components, sem passar pelo cliente.

**Edição**: a página `/registros/[id]` carrega o registro no servidor, converte
do formato do Prisma para `OccurrenceFormValues` e passa como valores iniciais
ao formulário. O envio chama `updateOccurrence(id, values)`, que revalida com o
mesmo `formSchema`, reaproveita `toOccurrenceCreateInput` e chama
`prisma.occurrence.update`.

A conversão inversa (Prisma → valores do formulário) é o espelho dos mapeadores
existentes: datas viram strings `YYYY-MM-DD`, números viram números, enums do
Prisma voltam aos valores literais do Zod, e nulos viram string vazia ou
`undefined` conforme o campo.

## Estrutura de arquivos

```
src/app/
  page.tsx                       listagem (Server Component)
  registros/novo/page.tsx        criação
  registros/[id]/page.tsx        edição (carrega o registro no servidor)

src/components/forms/
  occurrence-form.tsx            aceita valores iniciais e modo criar/editar
  occurrence-sections.tsx        casca do acordeão (novo)
  sections/*.tsx                 conteúdo, agora dentro dos blocos

src/components/registros/
  occurrence-list.tsx            lista, busca e abas (novo)

src/lib/actions/
  occurrence.ts                  ganha updateOccurrence
  occurrence-queries.ts          listOccurrences, getOccurrence (novo)
  occurrence-mappers.ts          ganha a conversão inversa (Prisma → formulário)

src/lib/schemas/
  occurrenceSchema.ts            remove a exigência de necropsia
```

Dependência nova: componente `accordion` do ShadCN.

## Verificação

O projeto não tem suíte de testes automatizados. O critério de aceite é manual,
com um caso crítico que precisa passar antes de qualquer outra coisa:

1. Criar um registro preenchendo apenas as três seções essenciais, com o animal
   marcado como **morto**, sem preencher necropsia. Deve salvar.
2. Voltar à listagem e confirmar que o registro aparece como **em aberto**.
3. Reabrir o registro e conferir, campo a campo, que **nada foi perdido** —
   com atenção especial à taxonomia (classe, ordem, família, gênero, espécie)
   e ao CODE de decomposição.
4. Complementar com dados de necropsia e salvar. Reabrir e conferir de novo.
5. Preencher o destino final. Confirmar que o registro migra para
   **encerrados**.
6. Repetir o ciclo no celular, em tela estreita.

## Riscos e pontos de atenção

**Exposição de dados sem autenticação.** O sistema não tem login. Com a tela de
listagem, qualquer pessoa com acesso ao endereço passa a ver todos os
registros, incluindo **coordenadas de GPS** de animais de espécies ameaçadas —
informação sensível por risco de caça e perturbação de sítios de encalhe. Não é
problema enquanto o sistema roda localmente, mas **o projeto de autenticação
precisa estar pronto antes de qualquer publicação na internet**.

**Dependência de PR aberto.** Este trabalho parte de `feat/occurrence-backend`,
que ainda está em revisão. Se aquele PR mudar durante a revisão, este branch
precisa ser rebaseado.

**Banco ainda não verificado ponta a ponta.** Nenhuma migration foi aplicada
contra um banco real até agora (o ambiente de desenvolvimento não tinha Docker
acessível, e a migração para Supabase acabou de ser preparada). A primeira
execução real de `prisma migrate dev` ainda vai acontecer, e pode revelar
ajustes no schema.

**Ficha oficial em papel.** A decisão de remover a numeração assume que a ficha
usada em campo não é numerada. Se aparecer uma versão numerada em uso no
instituto, vale reverter — numeração estável ajuda quem transcreve.
