// src/components/forms/occurrence-sections.tsx
"use client";

import { Control, UseFormSetValue, useWatch } from "react-hook-form";
import { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

import IdentificationSection from "./sections/identification-section";
import TriageSection from "./sections/triage-section";
import ClassificationSection from "./sections/classification-section";
import ClinicalEvaluationSection from "./sections/clinical-evaluation-section";
import NecropsySection from "./sections/necropsy-section";
import ComplementaryExamsSection from "./sections/complementary-exams-section";
import CaseOutcomeSection from "./sections/case-outcome-section";

interface OccurrenceSectionsProps {
  control: Control<OccurrenceFormValues>;
  setFormValue: UseFormSetValue<OccurrenceFormValues>;
}

type SectionStatus = "completo" | "pendente" | "opcional" | "naoAplicavel";

const STATUS_CONFIG: Record<
  SectionStatus,
  { label: string; className: string }
> = {
  completo: { label: "Completo", className: "bg-emerald-100 text-emerald-800" },
  pendente: {
    label: "Obrigatório pendente",
    className: "bg-amber-100 text-amber-800",
  },
  opcional: { label: "Opcional", className: "bg-slate-100 text-slate-700" },
  naoAplicavel: {
    label: "Não aplicável",
    className: "bg-slate-100 text-slate-400",
  },
};

function SectionBadge({ status }: { status: SectionStatus }) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

function isIdentificationComplete(values: OccurrenceFormValues): boolean {
  return Boolean(
    values.tomboIma &&
      values.responsavelRegistro &&
      values.dataOcorrencia &&
      values.horarioColeta &&
      values.uf &&
      values.municipio &&
      values.localEspecifico &&
      values.latitude &&
      values.longitude
  );
}

function isTriagemComplete(values: OccurrenceFormValues): boolean {
  return Boolean(
    values.tipoEntrada &&
      values.statusAnimal &&
      values.classificacaoOcorrencia &&
      values.interacaoPesca &&
      (values.interacaoPesca !== "Sim" || values.interacaoPescaDescricao)
  );
}

function isClassificacaoComplete(values: OccurrenceFormValues): boolean {
  return Boolean(
    values.classe &&
      values.ordem &&
      values.familia &&
      values.genero &&
      values.especie &&
      values.sexo &&
      values.faixaEtaria
  );
}

const OccurrenceSections = ({
  control,
  setFormValue,
}: OccurrenceSectionsProps) => {
  const watchedValues = useWatch({ control }) as OccurrenceFormValues;

  const identificacaoStatus: SectionStatus = isIdentificationComplete(
    watchedValues
  )
    ? "completo"
    : "pendente";
  const triagemStatus: SectionStatus = isTriagemComplete(watchedValues)
    ? "completo"
    : "pendente";
  const classificacaoStatus: SectionStatus = isClassificacaoComplete(
    watchedValues
  )
    ? "completo"
    : "pendente";
  const necropsiaStatus: SectionStatus =
    watchedValues.statusAnimal === "Morto" ? "opcional" : "naoAplicavel";

  return (
    <Accordion
      type="multiple"
      defaultValue={["identificacao", "triagem", "classificacao"]}
      className="space-y-4"
    >
      <AccordionItem value="identificacao" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Identificação
            <SectionBadge status={identificacaoStatus} />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <IdentificationSection
            control={control}
            watchedUf={watchedValues.uf}
            setFormValue={setFormValue}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="triagem" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Triagem e status
            <SectionBadge status={triagemStatus} />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <TriageSection
            control={control}
            watchedStatusAnimal={watchedValues.statusAnimal}
            watchedInteracaoPesca={watchedValues.interacaoPesca}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="classificacao" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Classificação biológica
            <SectionBadge status={classificacaoStatus} />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ClassificationSection
            control={control}
            setFormValue={setFormValue}
            watchedClasse={watchedValues.classe}
            watchedOrdem={watchedValues.ordem}
            watchedFamilia={watchedValues.familia}
            watchedGenero={watchedValues.genero}
            watchedEspecie={watchedValues.especie}
          />
        </AccordionContent>
      </AccordionItem>

      <div className="pt-2 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Preencha agora ou depois, conforme o caso evolui
      </div>

      <AccordionItem value="clinica" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Avaliação clínica
            <SectionBadge status="opcional" />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ClinicalEvaluationSection
            control={control}
            watchedClasse={watchedValues.classe}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="necropsia" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Necropsia
            <SectionBadge status={necropsiaStatus} />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <NecropsySection
            control={control}
            watchedStatusAnimal={watchedValues.statusAnimal}
            watchedPresencaTumores={watchedValues.presencaTumores}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="exames" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Exames complementares
            <SectionBadge status="opcional" />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <ComplementaryExamsSection control={control} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="desfecho" className="rounded-lg border px-4">
        <AccordionTrigger>
          <span className="flex items-center text-lg font-medium">
            Desfecho do caso
            <SectionBadge status="opcional" />
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <CaseOutcomeSection
            control={control}
            watchedDestinoFinal={watchedValues.destinoFinal}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default OccurrenceSections;
