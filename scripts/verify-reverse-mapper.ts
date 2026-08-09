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
    biometriaBicoUnidade: "mm",
    biometriaCcc: 200,
    biometriaCccUnidade: "m",
    biometriaLcc: 90,
    biometriaLccUnidade: "m",
    responsavelNecropsia: "Dra. Verificação",
    dataObito: "2026-08-08",
    presencaTumores: "sim",
    descricaoTumores: "Nódulo na nadadeira",
    causaMortisCategoria: "Antrópica",
    destinoFinal: "colecao cientifica IMA",
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
  assert.equal(formValues.destinoFinal, payload.destinoFinal);
  assert.equal(formValues.dataSaida, "");

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
