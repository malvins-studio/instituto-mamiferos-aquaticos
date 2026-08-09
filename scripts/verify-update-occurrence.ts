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
  console.log("1/3 OK: updateOccurrence persiste as alterações");

  // 2. Limpar um campo opcional previamente setado deve gravar null no banco
  //    (não deve deixar o valor antigo intacto — undefined em update() do Prisma
  //    significa "não alterar", por isso precisa virar null explicitamente).
  const cleared = await updateOccurrence(created.id, basePayload(TOMBO_A));
  assert.equal(cleared.success, true);
  const afterClear = await getOccurrence(created.id);
  assert.equal(afterClear?.destinoFinal, null);
  console.log("2/3 OK: updateOccurrence limpa campo opcional removido (undefined -> null)");

  // 3. Duplicidade de tomboIma também é tratada na atualização
  const other = await createOccurrence(basePayload(TOMBO_B));
  if (!other.success) throw new Error("falha ao criar segundo registro");

  const duplicate = await updateOccurrence(other.id, {
    ...basePayload(TOMBO_A), // tomboIma já usado pelo primeiro registro
  });
  assert.equal(duplicate.success, false);
  assert.ok(!duplicate.success && duplicate.errors.tomboIma);
  console.log("3/3 OK: updateOccurrence detecta tomboIma duplicado");

  await cleanup();
  await prisma.$disconnect();
  console.log("OK: updateOccurrence validado contra o banco real.");
}

main().catch(async (error) => {
  console.error(error);
  await cleanup();
  process.exit(1);
});
