// src/components/forms/occurrence-form.tsx
"use client";

import { useEffect } from "react"; // Importa o useEffect
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

// Componentes de Seção
import IdentificationSection from "./sections/identification-section";
import TriageSection from "./sections/triage-section";
// import ClassificationSection from "./sections/classification-section";
// import ClinicalEvaluationSection from "./sections/clinical-evaluation-section";
// import NecropsySection from "./sections/necropsy-section";
// import ComplementaryExamsSection from "./sections/complementary-exams-section";
// import CaseOutcomeSection from "./sections/case-outcome-section";

// Importa o schema e o tipo do arquivo dedicado
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
    resolver: zodResolver(formSchema),

    defaultValues: {
      // Seção 1
      tomboIma: "",
      responsavelRegistro: "",
      dataOcorrencia: "",
      horarioColeta: "",
      uf: "",
      municipio: "",
      localEspecifico: "",
      latitude: "",
      longitude: "",
      // Seção 2
      tipoEntrada: undefined,
      statusAnimal: undefined,
      classificacaoOcorrencia: undefined,
      codeDecomposicao: undefined,
      interacaoPesca: undefined,
      // TODO: Adicionar defaultValues para futuros campos do schema
    },
  });

  // "Observa" o valor do status para a lógica condicional (vivo ou morto)
  const watchedStatusAnimal = form.watch("statusAnimal");

  // 1. "Observa" o valor da UF para o select em cascata
  const watchedUf = form.watch("uf");
  // 2. Pega a função 'setValue' para passar para o filho
  const { setValue } = form;

  // Efeito para limpar o campo CODE se o animal estiver "Vivo"
  useEffect(() => {
    if (watchedStatusAnimal === "Vivo") {
      form.setValue("codeDecomposicao", undefined);
      form.clearErrors("codeDecomposicao");
    }
  }, [watchedStatusAnimal, form]); // Roda sempre que o status mudar

  /**
   * Função chamada após a validação bem-sucedida do formulário.
   * @param data - Os dados do formulário validados pelo schema Zod.
   */
  const onSubmit: SubmitHandler<OccurrenceFormValues> = (data) => {
    // TODO: Substituir este mockup pela chamada de API real.
    console.log("DADOS VALIDADOS:", JSON.stringify(data, null, 2));
    alert("Formulário enviado com sucesso! Verifique o console.");
  };

  return (
    // O provedor <Form> disponibiliza o estado do formulário para os <FormField>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Passa o 'control' para as seções */}
        <IdentificationSection
          control={form.control}
          watchedUf={watchedUf}
          setFormValue={setValue}
        />

        <TriageSection
          control={form.control}
          watchedStatusAnimal={watchedStatusAnimal}
        />

        {/* Placeholders para as futuras seções (ainda precisam receber 'control' quando implementadas)
        <ClassificationSection />
        <ClinicalEvaluationSection />
        <NecropsySection />
        <ComplementaryExamsSection />
        <CaseOutcomeSection /> 
        */}

        <Button
          type="submit"
          className="bg-brand-button-primary-bg text-brand-button-primary-fg hover:bg-brand-button-primary-bg/90"
        >
          Enviar Formulário
        </Button>
      </form>
    </Form>
  );
}
