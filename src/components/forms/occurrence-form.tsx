// src/components/forms/occurrence-form.tsx
"use client";

import { Button } from "@/components/ui/button";

export function OccurrenceForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Estrutura do formulário pronta! Agora podemos fazer o commit.");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <fieldset className="rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-lg font-medium">
          1. Identificação...
        </legend>
        <p className="pt-4 text-sm text-muted-foreground">
          (Campos virão aqui)
        </p>
      </fieldset>

      <fieldset className="rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-lg font-medium">
          2. Triagem...
        </legend>
        <p className="pt-4 text-sm text-muted-foreground">
          (Campos virão aqui)
        </p>
      </fieldset>

      <Button type="submit">Enviar (Teste)</Button>
    </form>
  );
}
