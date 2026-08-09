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
