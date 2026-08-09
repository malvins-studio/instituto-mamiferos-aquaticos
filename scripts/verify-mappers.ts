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
  nomeFoto: "", // Test empty-string → undefined conversion
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
  dataObito: "2026-08-09",
  causaMortisCategoria: "Patológica",
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
assert.equal(result.nomeFoto, undefined); // Empty string → undefined conversion
assert.deepEqual(result.dataObito, new Date("2026-08-09"));
assert.equal(result.causaMortisCategoria, "Patologica");

// Test latitude error handling with field property verification
assert.throws(
  () => toOccurrenceCreateInput({ ...basePayload, latitude: "não é número" }),
  OccurrenceMappingError
);

// Verify latitude error details
try {
  toOccurrenceCreateInput({ ...basePayload, latitude: "invalid" });
  assert.fail("Should have thrown OccurrenceMappingError");
} catch (error) {
  assert(error instanceof OccurrenceMappingError, "Error should be OccurrenceMappingError");
  assert.equal((error as OccurrenceMappingError).field, "latitude", "Error field should be latitude");
}

// Test longitude error handling
try {
  toOccurrenceCreateInput({ ...basePayload, longitude: "abc" });
  assert.fail("Should have thrown OccurrenceMappingError");
} catch (error) {
  assert(error instanceof OccurrenceMappingError, "Error should be OccurrenceMappingError");
  assert.equal((error as OccurrenceMappingError).field, "longitude", "Error field should be longitude");
}

console.log("OK: mapeadores de ocorrência validados.");
