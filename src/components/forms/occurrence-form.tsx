// src/components/forms/occurrence-form.tsx
"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Componentes de UI
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

// Componentes de Seção
import IdentificationSection from "./sections/identification-section";
import TriageSection from "./sections/triage-section";
import ClassificationSection from "./sections/classification-section";
// import ClinicalEvaluationSection from "./sections/clinical-evaluation-section";
// import NecropsySection from "./sections/necropsy-section";
// import ComplementaryExamsSection from "./sections/complementary-exams-section";
// import CaseOutcomeSection from "./sections/case-outcome-section";

import {
  formSchema,
  OccurrenceFormValues,
} from "@/lib/schemas/occurrenceSchema";

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
      // Seção 3
      classe: undefined,
      ordem: "",
      familia: "",
      genero: "",
      especie: "",
      nomeComum: "",
      sexo: undefined,
      faixaEtaria: undefined,
      anilhaNumero: "",
    },
  });

  // "Observa" todos os valores necessários para a lógica condicional
  const watchedStatusAnimal = form.watch("statusAnimal");
  const watchedUf = form.watch("uf");
  const watchedClasse = form.watch("classe");
  const watchedOrdem = form.watch("ordem");
  const watchedFamilia = form.watch("familia");
  const watchedGenero = form.watch("genero");
  const watchedEspecie = form.watch("especie");
  const { setValue, clearErrors } = form;

  // Efeito para limpar o campo CODE
  useEffect(() => {
    if (watchedStatusAnimal === "Vivo") {
      setValue("codeDecomposicao", undefined);
      clearErrors("codeDecomposicao");
    }
  }, [watchedStatusAnimal, setValue, clearErrors]);

  const onSubmit: SubmitHandler<OccurrenceFormValues> = (data) => {
    console.log("DADOS VALIDADOS:", JSON.stringify(data, null, 2));
    alert("Formulário enviado com sucesso! Verifique o console.");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <IdentificationSection
          control={form.control}
          watchedUf={watchedUf}
          setFormValue={setValue}
        />

        <TriageSection
          control={form.control}
          watchedStatusAnimal={watchedStatusAnimal}
        />

        {/* Passa todas as props necessárias para a Seção 3 */}
        <ClassificationSection
          control={form.control}
          setFormValue={setValue}
          watchedClasse={watchedClasse}
          watchedOrdem={watchedOrdem}
          watchedFamilia={watchedFamilia}
          watchedGenero={watchedGenero}
          watchedEspecie={watchedEspecie}
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
