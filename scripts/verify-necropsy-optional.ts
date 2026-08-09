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
