// src/lib/schemas/occurrenceSchema.ts
import { z } from "zod";

/*
 * Define o schema de validação e a tipagem para o formulário de ocorrência.
 */

//chema
export const formSchema = z.object({
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

  // Seção 2
  // Seção 3
  // Seção 4
  //...
});

export type OccurrenceFormValues = z.infer<typeof formSchema>;
