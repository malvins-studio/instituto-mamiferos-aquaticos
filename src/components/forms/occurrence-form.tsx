// src/components/forms/occurrence-form.tsx
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

// Componentes de Seção
import IdentificationSection from "./sections/identification-section";
// import TriageSection from "./sections/triage-section";
// import ClassificationSection from "./sections/classification-section";
// import ClinicalEvaluationSection from "./sections/clinical-evaluation-section";
// import NecropsySection from "./sections/necropsy-section";
// import ComplementaryExamsSection from "./sections/complementary-exams-section";
// import CaseOutcomeSection from "./sections/case-outcome-section";

// 1. Importa o schema e o tipo do arquivo dedicado
import {
  formSchema,
  OccurrenceFormValues,
} from "@/lib/schemas/occurrenceSchema";

/**
 * Componente principal que orquestra o formulário de ocorrência,
 * gerenciando o estado, validação (via Zod importado) e submissão.
 */
export function OccurrenceForm() {
  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(formSchema), // Conecta o Zod

    defaultValues: {
      tomboIma: "",
      responsavelRegistro: "",
      dataOcorrencia: "",
      horarioColeta: "",
      uf: "",
      municipio: "",
      localEspecifico: "",
      latitude: "",
      longitude: "",
      // TODO: Adicionar defaultValues para futuros campos do schema
    },
  });

  const onSubmit: SubmitHandler<OccurrenceFormValues> = (data) => {
    // TODO: Substituir este mockup pela chamada de API real.
    console.log("DADOS VALIDADOS:", JSON.stringify(data, null, 2));
    alert("Formulário enviado com sucesso! Verifique o console.");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <IdentificationSection control={form.control} />
        {/* <TriageSection control={form.control} />
        <ClassificationSection control={form.control} />
        <ClinicalEvaluationSection control={form.control} />
        <NecropsySection control={form.control} />
        <ComplementaryExamsSection control={form.control} />
        <CaseOutcomeSection control={form.control} /> */}

        <Button type="submit">Enviar Mockup</Button>
      </form>
    </Form>
  );
}
