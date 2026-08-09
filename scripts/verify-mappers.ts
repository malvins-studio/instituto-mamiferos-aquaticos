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
assert.equal(result.condicaoCorporal, "pessima");
assert.equal(result.destinoFinal, "colecao_cientifica_ima");
assert.equal(result.latitude, -1.4558);
assert.equal(result.longitude, -48.4902);
assert.deepEqual(result.dataOcorrencia, new Date("2026-08-08"));
assert.equal(result.nomeFoto, undefined);

assert.throws(
  () => toOccurrenceCreateInput({ ...basePayload, latitude: "não é número" }),
  OccurrenceMappingError
);

console.log("OK: mapeadores de ocorrência validados.");
