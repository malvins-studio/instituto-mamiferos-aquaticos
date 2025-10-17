// src/components/forms/occurrence-form.tsx
"use client";

import { Button } from "@/components/ui/button";

// Importando todos os nossos componentes de seção como placeholders estruturais
import IdentificationSection from "./sections/identification-section";
import TriageSection from "./sections/triage-section";
import ClassificationSection from "./sections/classification-section";
import ClinicalEvaluationSection from "./sections/clinical-evaluation-section";
import NecropsySection from "./sections/necropsy-section";
import ComplementaryExamsSection from "./sections/complementary-exams-section";
import CaseOutcomeSection from "./sections/case-outcome-section";

/**
 * Componente principal que orquestra e renderiza todas as seções do formulário.
 * Nesta fase, ele é puramente estrutural, sem lógica de estado ou validação.
 */
export function OccurrenceForm() {
  // Uma função de submissão simples para o formulário funcionar, prevenindo o recarregamento da página.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Estrutura de componentes do formulário renderizada com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <IdentificationSection />
      <TriageSection />
      <ClassificationSection />
      <ClinicalEvaluationSection />
      <NecropsySection />
      <ComplementaryExamsSection />
      <CaseOutcomeSection />

      <Button type="submit">Enviar Teste</Button>
    </form>
  );
}