// src/app/page.tsx
import { OccurrenceForm } from "@/components/forms/occurrence-form";

export default function Home() {
  return (
    <>
      {/* Barra de Título */}
      <div
        className="
          sticky top-20 md:top-24 z-40 w-full border-b 
          bg-background 
          shadow-sm 
        "
      >
        <div className="container mx-auto flex h-14 items-center px-4">
          <h1 className="text-xl font-bold tracking-tight text-brand-title-bar-fg">
            Formulário de Registro
          </h1>
        </div>
      </div>

      {/* Container Principal da Página */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-card p-6 md:p-8 rounded-lg border shadow-md">
          <OccurrenceForm />
        </div>
      </div>
    </>
  );
}
