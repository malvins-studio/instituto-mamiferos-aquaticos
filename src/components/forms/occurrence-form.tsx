// src/components/forms/occurrence-form.tsx
"use client";

import { useTransition } from "react";
import { useForm, SubmitHandler, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import OccurrenceSections from "./occurrence-sections";

import {
  formSchema,
  OccurrenceFormValues,
} from "@/lib/schemas/occurrenceSchema";
import { createOccurrence, updateOccurrence } from "@/lib/actions/occurrence";
import { useEffectSkipFirst } from "@/hooks/use-effect-skip-first";

const DEFAULT_VALUES: DefaultValues<OccurrenceFormValues> = {
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
  codeDecomposicao: 1,
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
  condicaoCorporal: undefined,
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
  causaMortisDiagnostico: "",
  causaMortisCategoria: undefined,
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
  pesoFinalUnidade: undefined,
  dataSaida: "",
  destinoFinal: undefined,
  outroDestinoEspecificar: "",
  observacoes: "",
};

interface OccurrenceFormProps {
  initialValues?: OccurrenceFormValues;
  occurrenceId?: string;
}

export function OccurrenceForm({
  initialValues,
  occurrenceId,
}: OccurrenceFormProps) {
  const form = useForm<OccurrenceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? DEFAULT_VALUES,
  });

  const watchedStatusAnimal = form.watch("statusAnimal");
  const watchedClasse = form.watch("classe");
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
        const result = occurrenceId
          ? await updateOccurrence(occurrenceId, data)
          : await createOccurrence(data);

        if (!result.success) {
          Object.entries(result.errors).forEach(([field, message]) => {
            form.setError(field as keyof OccurrenceFormValues, { message });
          });
          toast.error("Não foi possível salvar o registro.", {
            description: "Verifique os campos indicados no formulário.",
          });
          return;
        }

        toast.success(
          occurrenceId
            ? "Registro atualizado com sucesso!"
            : "Formulário enviado com sucesso!",
          {
            description: `O registro ${data.tomboIma} foi salvo (ID: ${result.id}).`,
            duration: 5000,
          }
        );
        if (!occurrenceId) {
          form.reset();
        }
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
        <OccurrenceSections control={form.control} setFormValue={setValue} />
        <Button
          type="submit"
          disabled={isPending}
          className="bg-brand-button-primary-bg text-brand-button-primary-fg hover:bg-brand-button-primary-bg/90"
        >
          {isPending
            ? "Enviando..."
            : occurrenceId
              ? "Salvar alterações"
              : "Enviar Formulário"}
        </Button>
      </form>
    </Form>
  );
}
