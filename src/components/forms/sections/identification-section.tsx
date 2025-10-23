// src/components/forms/sections/identification-section.tsx
"use client";

import { Control } from "react-hook-form";

import { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";

interface IdentificationSectionProps {
  control: Control<OccurrenceFormValues>;
}

const IdentificationSection = ({ control }: IdentificationSectionProps) => {
  // A prop 'control' é recebida, mas não é usada no JSX ainda.
  // Isso evita erros no componente pai ('occurrence-form.tsx').
  return (
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        1. Identificação e local da ocorrência
      </legend>
      <div className="pt-4">
        <p className="text-sm text-muted-foreground">
          (Campos da seção de identificação serão implementados aqui)
        </p>
      </div>
    </fieldset>
  );
};

export default IdentificationSection;
