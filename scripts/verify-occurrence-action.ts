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
