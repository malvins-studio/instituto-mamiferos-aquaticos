// src/lib/schemas/occurrenceSchema.ts
import { z } from "zod";

/**
 * Define o schema de validação e a tipagem para o formulário de ocorrência.
 */
export const formSchema = z
  .object({
    // Seção 1: Identificação
    tomboIma: z.string().min(1, { message: "O Tombo IMA é obrigatório." }),
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

    // Seção 2: Triagem e Status
    tipoEntrada: z.enum(["Pronto Atendimento", "Repasse por terceiros"], {
      message: "O tipo de entrada é obrigatório.",
    }),
    statusAnimal: z.enum(["Vivo", "Morto"], {
      message: "É obrigatório selecionar o status do animal.",
    }),
    classificacaoOcorrencia: z.enum(
      ["Resgate e Reabilitação", "Coleta", "Registro"],
      {
        message: "A classificação da ocorrência é obrigatória.",
      }
    ),
    codeDecomposicao: z.coerce
      .number({ message: "O CODE deve ser um número válido." })
      .min(1, { message: "O CODE é obrigatório e deve ser entre 1 e 5." })
      .max(5, { message: "O CODE deve ser entre 1 e 5." })
      .optional(),
    interacaoPesca: z.enum(["Sim", "Nao"], {
      message: "Informe sobre a interação com a pesca.",
    }),

    //  Seção 3: Classificação
    classe: z.enum(
      ["Amphibia", "Aves", "Elasmobranchii", "Mammalia", "Reptilia"],
      {
        message: "A classe é obrigatória.",
      }
    ),
    ordem: z.string().min(1, { message: "A ordem é obrigatória." }),
    familia: z.string().min(1, { message: "A família é obrigatória." }),
    genero: z.string().min(1, { message: "O gênero é obrigatório." }),
    especie: z.string().min(1, { message: "A espécie é obrigatória." }),
    nomeComum: z.string().optional(),
    sexo: z.enum(["sexo_macho", "sexo_femea", "sexo_indefinido"], {
      message: "O sexo é obrigatório.",
    }),
    faixaEtaria: z.enum(
      ["faixa_filhote", "faixa_juvenil", "faixa_subadulto", "faixa_adulto"],
      {
        message: "A faixa etária é obrigatória.",
      }
    ),
    anilhaNumero: z.string().optional(),

    //Seção 4
    pesoEntradaG: z.coerce.number().optional(),
    pesoEntradaGUnidade: z.enum(["g", "kg"]).optional(),
    condicaoCorporal: z.string().optional(),
    procedimentosClinicos: z.string().optional(),
    amostrasAntemortem: z.string().optional(),

    // Biometria
    biometriaCt: z.coerce.number().optional(),
    biometriaCtUnidade: z.enum(["cm", "mm", "m"]).optional(),
    biometriaCompBico: z.coerce.number().optional(),
    biometriaBicoUnidade: z.enum(["cm", "mm"]).optional(),
    biometriaCcc: z.coerce.number().optional(),
    biometriaCccUnidade: z.enum(["cm", "m"]).optional(),
    biometriaLcc: z.coerce.number().optional(),
    biometriaLccUnidade: z.enum(["cm", "m"]).optional(),

    //Seção 5
    responsavelNecropsia: z.string().optional(),
    dataObito: z.string().optional(),
    achadosNecropsia: z.string().optional(),
    presencaTumores: z.enum(["sim", "nao"]).optional(),
    descricaoTumores: z.string().optional(),
    causaMortis: z.string().optional(),
    amostrasPostmortem: z.string().optional(),

    //Seção 6
    resultadoRadiografia: z.string().optional(),
    resultadoToxicologico: z.string().optional(),
    resultadoHistopatologico: z.string().optional(),
    achadosBioquimica: z.string().optional(),
    achadosHemograma: z.string().optional(),
    achadosFezesUrina: z.string().optional(),
    resultadoMicrobiologico: z.string().optional(),

    // seção 7
    pesoFinal: z.coerce.number().optional(),
    pesoFinalUnidade: z.enum(["g", "kg"]).optional(),
    dataSaida: z.string().optional(),
    destinoFinal: z
      .enum([
        "soltura",
        "transferencia",
        "obito",
        "colecao_cientifica",
        "outro",
      ])
      .optional(),
    outroDestinoEspecificar: z.string().optional(),
    observacoes: z.string().optional(),
  })

  .superRefine((data, ctx) => {
    if (
      data.statusAnimal === "Morto" &&
      (!data.codeDecomposicao || data.codeDecomposicao < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O CODE de decomposição é obrigatório para animais mortos.",
        path: ["codeDecomposicao"],
      });
    }

    if (data.statusAnimal === "Morto") {
      if (
        !data.responsavelNecropsia ||
        data.responsavelNecropsia.trim() === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O responsável pela necropsia é obrigatório.",
          path: ["responsavelNecropsia"],
        });
      }
      if (!data.dataObito || data.dataObito.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A data do óbito é obrigatória.",
          path: ["dataObito"],
        });
      }
    }

    // Se 'presencaTumores' for 'sim', 'descricaoTumores' se torna obrigatório
    if (
      data.presencaTumores === "sim" &&
      (!data.descricaoTumores || data.descricaoTumores.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A descrição dos tumores é obrigatória.",
        path: ["descricaoTumores"],
      });
    }

    if (
      data.destinoFinal === "outro" &&
      (!data.outroDestinoEspecificar ||
        data.outroDestinoEspecificar.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Por favor, especifique o destino.",
        path: ["outroDestinoEspecificar"],
      });
    }
  });

export type OccurrenceFormValues = z.infer<typeof formSchema>;
