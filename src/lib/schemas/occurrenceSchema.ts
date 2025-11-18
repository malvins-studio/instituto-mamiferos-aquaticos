import { z } from "zod";

export const formSchema = z
  .object({
    // === Seção 1: Identificação ===
    tomboIma: z
      .string()
      .regex(/^IMA\d{5}$/, {
        message:
          "Formato inválido. Deve ser IMA seguido de 5 dígitos (ex: IMA00001).",
      })
      .min(1, { message: "O Tombo IMA é obrigatório." }),
    responsavelRegistro: z
      .string()
      .min(1, { message: "O responsável é obrigatório." }),
    dataOcorrencia: z.string().min(1, { message: "A data é obrigatória." }),
    horarioColeta: z.string().min(1, { message: "O horário é obrigatório." }),
    uf: z.string().min(1, { message: "O estado (UF) é obrigatório." }),
    municipio: z.string().min(1, { message: "O município é obrigatório." }),
    localEspecifico: z.string().min(1, { message: "O local é obrigatório." }),
    latitude: z.string().min(1, { message: "A latitude é obrigatória." }),
    longitude: z.string().min(1, { message: "A longitude é obrigatória." }),
    nomeFoto: z.string().optional(),

    // === Seção 2: Triagem e Status ===
    tipoEntrada: z.enum(
      ["Entrega voluntária", "Repasse por terceiros", "Pronto Atendimento"],
      { message: "O tipo de entrada é obrigatório." }
    ),
    statusAnimal: z.enum(["Vivo", "Morto"], {
      message: "É obrigatório selecionar o status do animal.",
    }),
    classificacaoOcorrencia: z.enum(
      ["Resgate e Reabilitação", "Coleta", "Registro", "Manutenção", "Encalhe"],
      { message: "A classificação da ocorrência é obrigatória." }
    ),

    codeDecomposicao: z.coerce
      .number({ message: "O CODE deve ser um número válido." })
      .int()
      .min(1, "Mínimo 1")
      .max(5, "Máximo 5"),

    interacaoPesca: z.enum(["Sim", "Nao"], {
      message: "Informe sobre a interação com a pesca.",
    }),
    interacaoPescaDescricao: z.string().optional(),

    // === Seção 3: Classificação ===
    classe: z.enum(
      ["Amphibia", "Aves", "Elasmobranchii", "Mammalia", "Reptilia"],
      {
        message: "A classe é obrigatória.",
      }
    ),
    ordem: z.string().min(1, "A ordem é obrigatória."),
    familia: z.string().min(1, "A família é obrigatória."),
    genero: z.string().min(1, "O gênero é obrigatório."),
    especie: z.string().min(1, "A espécie é obrigatória."),
    nomeComum: z.string().optional(),
    sexo: z.enum(["M", "F", "IN"], { message: "O sexo é obrigatório." }),
    faixaEtaria: z.enum(["feto", "filhote", "juvenil", "subadulto", "adulto"], {
      message: "A faixa etária é obrigatória.",
    }),
    anilhaNumero: z.string().optional(),

    // === Seção 4: Avaliação Clínica ===
    pesoEntradaG: z.coerce.number().nonnegative().optional(),
    pesoEntradaGUnidade: z.enum(["g", "kg"]).optional(),
    condicaoCorporal: z.enum(["boa", "regular", "péssima"]).optional(),
    procedimentosClinicos: z.string().optional(),
    amostrasAntemortem: z.string().optional(),

    // Biometria
    biometriaCt: z.coerce.number().nonnegative().optional(),
    biometriaCtUnidade: z.enum(["cm", "mm", "m"]).optional(),
    biometriaCompBico: z.coerce.number().nonnegative().optional(),
    biometriaBicoUnidade: z.enum(["cm", "mm"]).optional(),
    biometriaCcc: z.coerce.number().nonnegative().optional(),
    biometriaCccUnidade: z.enum(["cm", "m"]).optional(),
    biometriaLcc: z.coerce.number().nonnegative().optional(),
    biometriaLccUnidade: z.enum(["cm", "m"]).optional(),

    // === Seção 5: Necropsia ===
    responsavelNecropsia: z.string().optional(),
    dataObito: z.string().optional(),
    achadosNecropsia: z.string().optional(),
    presencaTumores: z.enum(["sim", "nao"]).optional(),
    descricaoTumores: z.string().optional(),
    causaMortisDiagnostico: z.string().optional(),
    causaMortisCategoria: z
      .enum([
        "Antrópica",
        "Patológica",
        "Fisiológica",
        "Desconhecida",
        "Indeterminada",
      ])
      .optional(),
    amostrasPostmortem: z.string().optional(),

    // === Seção 6: Exames Complementares ===
    resultadoRadiografia: z.string().optional(),
    resultadoToxicologico: z.string().optional(),
    resultadoHistopatologico: z.string().optional(),
    achadosBioquimica: z.string().optional(),
    achadosHemograma: z.string().optional(),
    achadosFezesUrina: z.string().optional(),
    resultadoMicrobiologico: z.string().optional(),

    // === Seção 7: Desfecho do Caso ===
    pesoFinal: z.coerce.number().nonnegative().optional(),
    pesoFinalUnidade: z.enum(["g", "kg"]).optional(),
    dataSaida: z.string().optional(),
    destinoFinal: z
      .enum([
        "soltura",
        "transferencia",
        "obito",
        "colecao_cientifica",
        "enterro",
        "incineracao",
        "maceracao",
        "doacao",
        "colecao cientifica IMA",
        "outro",
      ])
      .optional(),
    outroDestinoEspecificar: z.string().optional(),
    observacoes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.statusAnimal === "Vivo" && data.codeDecomposicao !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Para animais "Vivo", o CODE deve ser 1.',
        path: ["codeDecomposicao"],
      });
    }
    if (
      data.statusAnimal === "Morto" &&
      (data.codeDecomposicao < 2 || data.codeDecomposicao > 5)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Para animais "Morto", o CODE deve ser entre 2 e 5.',
        path: ["codeDecomposicao"],
      });
    }

    // Interação Pesca
    if (data.interacaoPesca === "Sim" && !data.interacaoPescaDescricao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A descrição da interação é obrigatória.",
        path: ["interacaoPescaDescricao"],
      });
    }

    // Necropsia Obrigatória se Morto
    if (data.statusAnimal === "Morto") {
      if (!data.responsavelNecropsia)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Obrigatório.",
          path: ["responsavelNecropsia"],
        });
      if (!data.dataObito)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Obrigatório.",
          path: ["dataObito"],
        });
    }

    // Desfecho Outro
    if (data.destinoFinal === "outro" && !data.outroDestinoEspecificar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Especifique o destino.",
        path: ["outroDestinoEspecificar"],
      });
    }

    // Tumores
    if (data.presencaTumores === "sim" && !data.descricaoTumores) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Descreva os tumores.",
        path: ["descricaoTumores"],
      });
    }
  });

export type OccurrenceFormValues = z.infer<typeof formSchema>;
