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

    // TODO: Adicionar campos das próximas seções aqui
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

    // TODO: Adicionar lógica condicional da Anilha aqui
  });

export type OccurrenceFormValues = z.infer<typeof formSchema>;
