import {
  CausaMortisCategoria,
  ClassificacaoOcorrencia,
  CondicaoCorporal,
  DestinoFinal,
  Prisma,
  SimNao,
  TipoEntrada,
} from "@prisma/client";
import type { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";

export class OccurrenceMappingError extends Error {
  constructor(public readonly field: string, message: string) {
    super(message);
    this.name = "OccurrenceMappingError";
  }
}

const TIPO_ENTRADA_MAP: Record<OccurrenceFormValues["tipoEntrada"], TipoEntrada> = {
  "Entrega voluntária": TipoEntrada.ENTREGA_VOLUNTARIA,
  "Repasse por terceiros": TipoEntrada.REPASSE_TERCEIROS,
  "Pronto Atendimento": TipoEntrada.PRONTO_ATENDIMENTO,
};

const CLASSIFICACAO_OCORRENCIA_MAP: Record<
  OccurrenceFormValues["classificacaoOcorrencia"],
  ClassificacaoOcorrencia
> = {
  "Resgate e Reabilitação": ClassificacaoOcorrencia.RESGATE_REABILITACAO,
  Coleta: ClassificacaoOcorrencia.COLETA,
  Registro: ClassificacaoOcorrencia.REGISTRO,
  "Manutenção": ClassificacaoOcorrencia.MANUTENCAO,
  Encalhe: ClassificacaoOcorrencia.ENCALHE,
};

const CONDICAO_CORPORAL_MAP: Record<
  NonNullable<OccurrenceFormValues["condicaoCorporal"]>,
  CondicaoCorporal
> = {
  boa: CondicaoCorporal.boa,
  regular: CondicaoCorporal.regular,
  "péssima": CondicaoCorporal.pessima,
};

const CAUSA_MORTIS_CATEGORIA_MAP: Record<
  NonNullable<OccurrenceFormValues["causaMortisCategoria"]>,
  CausaMortisCategoria
> = {
  "Antrópica": CausaMortisCategoria.Antropica,
  "Patológica": CausaMortisCategoria.Patologica,
  "Fisiológica": CausaMortisCategoria.Fisiologica,
  Desconhecida: CausaMortisCategoria.Desconhecida,
  Indeterminada: CausaMortisCategoria.Indeterminada,
};

const DESTINO_FINAL_MAP: Record<
  NonNullable<OccurrenceFormValues["destinoFinal"]>,
  DestinoFinal
> = {
  soltura: DestinoFinal.soltura,
  transferencia: DestinoFinal.transferencia,
  obito: DestinoFinal.obito,
  colecao_cientifica: DestinoFinal.colecao_cientifica,
  enterro: DestinoFinal.enterro,
  incineracao: DestinoFinal.incineracao,
  maceracao: DestinoFinal.maceracao,
  doacao: DestinoFinal.doacao,
  "colecao cientifica IMA": DestinoFinal.colecao_cientifica_ima,
  outro: DestinoFinal.outro,
};

function parseCoordinate(field: "latitude" | "longitude", raw: string): number {
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    const label = field === "latitude" ? "Latitude" : "Longitude";
    throw new OccurrenceMappingError(field, `${label} deve ser um número válido.`);
  }
  return value;
}

function emptyToUndefined(value: string | undefined): string | undefined {
  return value === undefined || value === "" ? undefined : value;
}

function mapPresencaTumores(
  value: OccurrenceFormValues["presencaTumores"]
): SimNao | undefined {
  if (value === undefined) return undefined;
  return value === "sim" ? SimNao.Sim : SimNao.Nao;
}

export function toOccurrenceCreateInput(
  values: OccurrenceFormValues
): Prisma.OccurrenceCreateInput {
  return {
    tomboIma: values.tomboIma,
    responsavelRegistro: values.responsavelRegistro,
    dataOcorrencia: new Date(values.dataOcorrencia),
    horarioColeta: values.horarioColeta,
    uf: values.uf,
    municipio: values.municipio,
    localEspecifico: values.localEspecifico,
    latitude: parseCoordinate("latitude", values.latitude),
    longitude: parseCoordinate("longitude", values.longitude),
    nomeFoto: emptyToUndefined(values.nomeFoto),

    tipoEntrada: TIPO_ENTRADA_MAP[values.tipoEntrada],
    statusAnimal: values.statusAnimal,
    classificacaoOcorrencia: CLASSIFICACAO_OCORRENCIA_MAP[values.classificacaoOcorrencia],
    codeDecomposicao: values.codeDecomposicao,
    interacaoPesca: values.interacaoPesca,
    interacaoPescaDescricao: emptyToUndefined(values.interacaoPescaDescricao),

    classe: values.classe,
    ordem: values.ordem,
    familia: values.familia,
    genero: values.genero,
    especie: values.especie,
    nomeComum: emptyToUndefined(values.nomeComum),
    sexo: values.sexo,
    faixaEtaria: values.faixaEtaria,
    anilhaNumero: emptyToUndefined(values.anilhaNumero),

    pesoEntradaG: values.pesoEntradaG,
    pesoEntradaGUnidade: values.pesoEntradaGUnidade,
    condicaoCorporal: values.condicaoCorporal
      ? CONDICAO_CORPORAL_MAP[values.condicaoCorporal]
      : undefined,
    procedimentosClinicos: emptyToUndefined(values.procedimentosClinicos),
    amostrasAntemortem: emptyToUndefined(values.amostrasAntemortem),
    biometriaCt: values.biometriaCt,
    biometriaCtUnidade: values.biometriaCtUnidade,
    biometriaCompBico: values.biometriaCompBico,
    biometriaBicoUnidade: values.biometriaBicoUnidade,
    biometriaCcc: values.biometriaCcc,
    biometriaCccUnidade: values.biometriaCccUnidade,
    biometriaLcc: values.biometriaLcc,
    biometriaLccUnidade: values.biometriaLccUnidade,

    responsavelNecropsia: emptyToUndefined(values.responsavelNecropsia),
    dataObito: values.dataObito ? new Date(values.dataObito) : undefined,
    achadosNecropsia: emptyToUndefined(values.achadosNecropsia),
    presencaTumores: mapPresencaTumores(values.presencaTumores),
    descricaoTumores: emptyToUndefined(values.descricaoTumores),
    causaMortisDiagnostico: emptyToUndefined(values.causaMortisDiagnostico),
    causaMortisCategoria: values.causaMortisCategoria
      ? CAUSA_MORTIS_CATEGORIA_MAP[values.causaMortisCategoria]
      : undefined,
    amostrasPostmortem: emptyToUndefined(values.amostrasPostmortem),

    resultadoRadiografia: emptyToUndefined(values.resultadoRadiografia),
    resultadoToxicologico: emptyToUndefined(values.resultadoToxicologico),
    resultadoHistopatologico: emptyToUndefined(values.resultadoHistopatologico),
    achadosBioquimica: emptyToUndefined(values.achadosBioquimica),
    achadosHemograma: emptyToUndefined(values.achadosHemograma),
    achadosFezesUrina: emptyToUndefined(values.achadosFezesUrina),
    resultadoMicrobiologico: emptyToUndefined(values.resultadoMicrobiologico),

    pesoFinal: values.pesoFinal,
    pesoFinalUnidade: values.pesoFinalUnidade,
    dataSaida: values.dataSaida ? new Date(values.dataSaida) : undefined,
    destinoFinal: values.destinoFinal ? DESTINO_FINAL_MAP[values.destinoFinal] : undefined,
    outroDestinoEspecificar: emptyToUndefined(values.outroDestinoEspecificar),
    observacoes: emptyToUndefined(values.observacoes),
  };
}
