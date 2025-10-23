// src/app/page.tsx
import { OccurrenceForm } from "@/components/forms/occurrence-form";

export default function Home() {
  return (
    <>
      <div
        className="
          sticky top-20 md:top-24 z-40 w-full border-b 
          bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
          mt-4 md:mt-0 
        "
      >
        <div className="container mx-auto flex h-12 items-center px-4">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Formulário de Registro
          </h1>
        </div>
      </div>

      {/* Conteúdo principal da página (o formulário) */}
      {/* Não precisa de margem extra aqui, pois a barra de título já empurra */}
      <div className="container mx-auto px-4 py-12">
        <OccurrenceForm />
      </div>
    </>
  );
}
