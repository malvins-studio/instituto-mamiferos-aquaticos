import Link from "next/link";
import { OccurrenceForm } from "@/components/forms/occurrence-form";

export default function NovoRegistroPage() {
  return (
    <>
      <div className="sticky top-20 md:top-24 z-40 w-full bg-gradient-to-r from-brand-primary to-brand-accent shadow-md">
        <div className="container mx-auto px-4 py-6 flex flex-col gap-3">
          <Link
            href="/"
            className="text-sm text-white hover:text-white/80 transition-colors font-medium w-fit"
          >
            ← Voltar
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Novo Registro
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Preencha os dados da ocorrência
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl bg-white p-6 md:p-8 rounded-xl border-2 border-brand-accent/30 shadow-lg">
          <OccurrenceForm />
        </div>
      </div>
    </>
  );
}
