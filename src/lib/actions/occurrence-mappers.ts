import {
  CausaMortisCategoria,
  ClassificacaoOcorrencia,
  CondicaoCorporal,
  DestinoFinal,
  Prisma,
  SimNao,
  TipoEntrada,
  type Occurrence,
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

const TIPO_ENTRADA_REVERSE_MAP: Record<TipoEntrada, OccurrenceFormValues["tipoEntrada"]> = {
  [TipoEntrada.ENTREGA_VOLUNTARIA]: "Entrega voluntária",
  [TipoEntrada.REPASSE_TERCEIROS]: "Repasse por terceiros",
  [TipoEntrada.PRONTO_ATENDIMENTO]: "Pronto Atendimento",
};

const CLASSIFICACAO_OCORRENCIA_REVERSE_MAP: Record<
  ClassificacaoOcorrencia,
  OccurrenceFormValues["classificacaoOcorrencia"]
> = {
  [ClassificacaoOcorrencia.RESGATE_REABILITACAO]: "Resgate e Reabilitação",
  [ClassificacaoOcorrencia.COLETA]: "Coleta",
  [ClassificacaoOcorrencia.REGISTRO]: "Registro",
  [ClassificacaoOcorrencia.MANUTENCAO]: "Manutenção",
  [ClassificacaoOcorrencia.ENCALHE]: "Encalhe",
};

const CONDICAO_CORPORAL_REVERSE_MAP: Record<
  CondicaoCorporal,
  NonNullable<OccurrenceFormValues["condicaoCorporal"]>
> = {
  [CondicaoCorporal.boa]: "boa",
  [CondicaoCorporal.regular]: "regular",
  [CondicaoCorporal.pessima]: "péssima",
};

const CAUSA_MORTIS_CATEGORIA_REVERSE_MAP: Record<
  CausaMortisCategoria,
  NonNullable<OccurrenceFormValues["causaMortisCategoria"]>
> = {
  [CausaMortisCategoria.Antropica]: "Antrópica",
  [CausaMortisCategoria.Patologica]: "Patológica",
  [CausaMortisCategoria.Fisiologica]: "Fisiológica",
  [CausaMortisCategoria.Desconhecida]: "Desconhecida",
  [CausaMortisCategoria.Indeterminada]: "Indeterminada",
};

const DESTINO_FINAL_REVERSE_MAP: Record<
  DestinoFinal,
  NonNullable<OccurrenceFormValues["destinoFinal"]>
> = {
  [DestinoFinal.soltura]: "soltura",
  [DestinoFinal.transferencia]: "transferencia",
  [DestinoFinal.obito]: "obito",
  [DestinoFinal.colecao_cientifica]: "colecao_cientifica",
  [DestinoFinal.enterro]: "enterro",
  [DestinoFinal.incineracao]: "incineracao",
  [DestinoFinal.maceracao]: "maceracao",
  [DestinoFinal.doacao]: "doacao",
  [DestinoFinal.colecao_cientifica_ima]: "colecao cientifica IMA",
  [DestinoFinal.outro]: "outro",
};

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toFormString(value: string | null): string {
  return value ?? "";
}

function mapPresencaTumoresToForm(
  value: SimNao | null
): OccurrenceFormValues["presencaTumores"] {
  if (value === null) return undefined;
  return value === SimNao.Sim ? "sim" : "nao";
}

export function toOccurrenceFormValues(
  occurrence: Occurrence
): OccurrenceFormValues {
  return {
    tomboIma: occurrence.tomboIma,
    responsavelRegistro: occurrence.responsavelRegistro,
    dataOcorrencia: formatDateOnly(occurrence.dataOcorrencia),
    horarioColeta: occurrence.horarioColeta,
    uf: occurrence.uf,
    municipio: occurrence.municipio,
    localEspecifico: occurrence.localEspecifico,
    latitude: String(occurrence.latitude),
    longitude: String(occurrence.longitude),
    nomeFoto: toFormString(occurrence.nomeFoto),

    tipoEntrada: TIPO_ENTRADA_REVERSE_MAP[occurrence.tipoEntrada],
    statusAnimal: occurrence.statusAnimal,
    classificacaoOcorrencia:
      CLASSIFICACAO_OCORRENCIA_REVERSE_MAP[occurrence.classificacaoOcorrencia],
    codeDecomposicao: occurrence.codeDecomposicao,
    interacaoPesca: occurrence.interacaoPesca,
    interacaoPescaDescricao: toFormString(occurrence.interacaoPescaDescricao),

    classe: occurrence.classe,
    ordem: occurrence.ordem,
    familia: occurrence.familia,
    genero: occurrence.genero,
    especie: occurrence.especie,
    nomeComum: toFormString(occurrence.nomeComum),
    sexo: occurrence.sexo,
    faixaEtaria: occurrence.faixaEtaria,
    anilhaNumero: toFormString(occurrence.anilhaNumero),

    pesoEntradaG: occurrence.pesoEntradaG ?? undefined,
    pesoEntradaGUnidade: occurrence.pesoEntradaGUnidade ?? undefined,
    condicaoCorporal: occurrence.condicaoCorporal
      ? CONDICAO_CORPORAL_REVERSE_MAP[occurrence.condicaoCorporal]
      : undefined,
    procedimentosClinicos: toFormString(occurrence.procedimentosClinicos),
    amostrasAntemortem: toFormString(occurrence.amostrasAntemortem),
    biometriaCt: occurrence.biometriaCt ?? undefined,
    biometriaCtUnidade: occurrence.biometriaCtUnidade ?? undefined,
    biometriaCompBico: occurrence.biometriaCompBico ?? undefined,
    // UnidadeComprimento no Prisma é "mm"|"cm"|"m" para os 4 campos de
    // biometria, mas o Zod restringe cada campo a um subconjunto (bico:
    // "cm"|"mm"; ccc/lcc: "cm"|"m") — decisão já registrada, o Zod
    // revalida no submit se o valor não fizer sentido para o campo.
    biometriaBicoUnidade: occurrence.biometriaBicoUnidade as
      | OccurrenceFormValues["biometriaBicoUnidade"]
      | undefined ?? undefined,
    biometriaCcc: occurrence.biometriaCcc ?? undefined,
    biometriaCccUnidade: occurrence.biometriaCccUnidade as
      | OccurrenceFormValues["biometriaCccUnidade"]
      | undefined ?? undefined,
    biometriaLcc: occurrence.biometriaLcc ?? undefined,
    biometriaLccUnidade: occurrence.biometriaLccUnidade as
      | OccurrenceFormValues["biometriaLccUnidade"]
      | undefined ?? undefined,

    responsavelNecropsia: toFormString(occurrence.responsavelNecropsia),
    dataObito: occurrence.dataObito ? formatDateOnly(occurrence.dataObito) : "",
    achadosNecropsia: toFormString(occurrence.achadosNecropsia),
    presencaTumores: mapPresencaTumoresToForm(occurrence.presencaTumores),
    descricaoTumores: toFormString(occurrence.descricaoTumores),
    causaMortisDiagnostico: toFormString(occurrence.causaMortisDiagnostico),
    causaMortisCategoria: occurrence.causaMortisCategoria
      ? CAUSA_MORTIS_CATEGORIA_REVERSE_MAP[occurrence.causaMortisCategoria]
      : undefined,
    amostrasPostmortem: toFormString(occurrence.amostrasPostmortem),

    resultadoRadiografia: toFormString(occurrence.resultadoRadiografia),
    resultadoToxicologico: toFormString(occurrence.resultadoToxicologico),
    resultadoHistopatologico: toFormString(occurrence.resultadoHistopatologico),
    achadosBioquimica: toFormString(occurrence.achadosBioquimica),
    achadosHemograma: toFormString(occurrence.achadosHemograma),
    achadosFezesUrina: toFormString(occurrence.achadosFezesUrina),
    resultadoMicrobiologico: toFormString(occurrence.resultadoMicrobiologico),

    pesoFinal: occurrence.pesoFinal ?? undefined,
    pesoFinalUnidade: occurrence.pesoFinalUnidade ?? undefined,
    dataSaida: occurrence.dataSaida ? formatDateOnly(occurrence.dataSaida) : "",
    destinoFinal: occurrence.destinoFinal
      ? DESTINO_FINAL_REVERSE_MAP[occurrence.destinoFinal]
      : undefined,
    outroDestinoEspecificar: toFormString(occurrence.outroDestinoEspecificar),
    observacoes: toFormString(occurrence.observacoes),
  };
}
