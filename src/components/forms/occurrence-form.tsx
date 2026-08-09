"use client";

import { useTransition } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import IdentificationSection from "./sections/identification-section";
import TriageSection from "./sections/triage-section";
import ClassificationSection from "./sections/classification-section";
import ClinicalEvaluationSection from "./sections/clinical-evaluation-section";
import NecropsySection from "./sections/necropsy-section";
import ComplementaryExamsSection from "./sections/complementary-exams-section";
import CaseOutcomeSection from "./sections/case-outcome-section";

import {
  formSchema,
  OccurrenceFormValues,
} from "@/lib/schemas/occurrenceSchema";
import { createOccurrence } from "@/lib/actions/occurrence";
import { useEffectSkipFirst } from "@/hooks/use-effect-skip-first";

export function OccurrenceForm() {
  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // 1. Identificação
      tomboIma: "",
      responsavelRegistro: "",
      dataOcorrencia: "",
      horarioColeta: "",
      uf: "",
      municipio: "",
      localEspecifico: "",
      latitude: "",
      longitude: "",
      nomeFoto: "",

      // 2. Triagem
      tipoEntrada: undefined,
      statusAnimal: undefined,
      classificacaoOcorrencia: undefined,
      codeDecomposicao: 1, // Padrão inicial
      interacaoPesca: undefined,
      interacaoPescaDescricao: "",

      // 3. Classificação
      classe: undefined,
      ordem: "",
      familia: "",
      genero: "",
      especie: "",
      nomeComum: "",
      sexo: undefined,
      faixaEtaria: undefined,
      anilhaNumero: "",

      // 4. Clínica
      pesoEntradaG: undefined,
      pesoEntradaGUnidade: undefined,
      condicaoCorporal: undefined, // Agora é undefined (enum)
      procedimentosClinicos: "",
      amostrasAntemortem: "",
      biometriaCt: undefined,
      biometriaCtUnidade: undefined,
      biometriaCompBico: undefined,
      biometriaBicoUnidade: undefined,
      biometriaCcc: undefined,
      biometriaCccUnidade: undefined,
      biometriaLcc: undefined,
      biometriaLccUnidade: undefined,

      // 5. Necropsia
      responsavelNecropsia: "",
      dataObito: "",
      achadosNecropsia: "",
      presencaTumores: undefined,
      descricaoTumores: "",
      causaMortisDiagnostico: "", // Novo campo
      causaMortisCategoria: undefined, // Novo campo
      amostrasPostmortem: "",

      // 6. Exames
      resultadoRadiografia: "",
      resultadoToxicologico: "",
      resultadoHistopatologico: "",
      achadosBioquimica: "",
      achadosHemograma: "",
      achadosFezesUrina: "",
      resultadoMicrobiologico: "",

      // 7. Desfecho
      pesoFinal: undefined,
      pesoFinalUnidade: undefined, // Novos campos
      dataSaida: "",
      destinoFinal: undefined,
      outroDestinoEspecificar: "",
      observacoes: "",
    },
  });

  const watchedStatusAnimal = form.watch("statusAnimal");
  const watchedUf = form.watch("uf");
  const watchedClasse = form.watch("classe");
  const watchedEspecie = form.watch("especie");
  const watchedPresencaTumores = form.watch("presencaTumores");
  const watchedDestinoFinal = form.watch("destinoFinal");
  const watchedInteracaoPesca = form.watch("interacaoPesca");

  const { setValue, clearErrors } = form;

  const [isPending, startTransition] = useTransition();

  // Lógica do CODE
  useEffectSkipFirst(() => {
    if (watchedStatusAnimal === "Vivo") {
      setValue("codeDecomposicao", 1);
      clearErrors("codeDecomposicao");
    } else if (watchedStatusAnimal === "Morto") {
      setValue("codeDecomposicao", 0); // 0 força erro no Zod (min 1/2), obrigando escolha
    }
  }, [watchedStatusAnimal, setValue, clearErrors]);

  // Limpeza de campos condicionais
  useEffectSkipFirst(() => {
    if (watchedStatusAnimal === "Vivo") {
      setValue("responsavelNecropsia", "");
      setValue("dataObito", "");
      setValue("achadosNecropsia", "");
      setValue("presencaTumores", undefined);
      setValue("descricaoTumores", "");
      setValue("causaMortisDiagnostico", "");
      setValue("causaMortisCategoria", undefined);
      setValue("amostrasPostmortem", "");
      clearErrors();
    }
  }, [watchedStatusAnimal, setValue, clearErrors]);

  useEffectSkipFirst(() => {
    if (watchedInteracaoPesca === "Nao") {
      setValue("interacaoPescaDescricao", "");
      clearErrors("interacaoPescaDescricao");
    }
  }, [watchedInteracaoPesca, setValue, clearErrors]);

  useEffectSkipFirst(() => {
    if (watchedClasse !== "Aves" && watchedClasse !== "Reptilia") {
      setValue("anilhaNumero", "");
      clearErrors("anilhaNumero");
    }
  }, [watchedClasse, setValue, clearErrors]);

  const onSubmit: SubmitHandler<OccurrenceFormValues> = (data) => {
    startTransition(async () => {
      try {
        const result = await createOccurrence(data);

        if (!result.success) {
          Object.entries(result.errors).forEach(([field, message]) => {
            form.setError(field as keyof OccurrenceFormValues, { message });
          });
          toast.error("Não foi possível salvar o registro.", {
            description: "Verifique os campos indicados no formulário.",
          });
          return;
        }

        toast.success("Formulário enviado com sucesso!", {
          description: `O registro ${data.tomboIma} foi salvo (ID: ${result.id}).`,
          duration: 5000,
        });
        form.reset();
      } catch {
        toast.error("Ocorreu um erro inesperado ao salvar o registro.", {
          description: "Tente novamente em instantes.",
        });
      }
    });
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
          watchedInteracaoPesca={watchedInteracaoPesca}
        />
        <ClassificationSection
          control={form.control}
          setFormValue={setValue}
          watchedClasse={watchedClasse}
          watchedOrdem={form.watch("ordem")}
          watchedFamilia={form.watch("familia")}
          watchedGenero={form.watch("genero")}
          watchedEspecie={watchedEspecie}
        />
        <ClinicalEvaluationSection
          control={form.control}
          watchedClasse={watchedClasse}
        />
        <NecropsySection
          control={form.control}
          watchedStatusAnimal={watchedStatusAnimal}
          watchedPresencaTumores={watchedPresencaTumores}
        />
        <ComplementaryExamsSection control={form.control} />
        <CaseOutcomeSection
          control={form.control}
          watchedDestinoFinal={watchedDestinoFinal}
        />
        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-button-primary-bg text-brand-button-primary-fg hover:bg-brand-button-primary-bg/90"
        >
          {isPending ? "Enviando..." : "Enviar Formulário"}
        </Button>
      </form>
    </Form>
  );
}
