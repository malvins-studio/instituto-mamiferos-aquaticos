// src/app/page.tsx
import Link from "next/link";
import { listOccurrences, type OccurrenceSituacao } from "@/services/api";
import { OccurrenceList } from "@/components/registros/occurrence-list";

function parseSituacao(value: string | undefined): OccurrenceSituacao {
  if (value === "aberto" || value === "encerrado" || value === "todos") {
    return value;
  }
  return "aberto";
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ situacao?: string; busca?: string }>;
}) {
  const params = await searchParams;
  const situacao = parseSituacao(params.situacao);
  const busca = params.busca ?? "";

  const occurrences = await listOccurrences({
    situacao,
    busca: busca || undefined,
  });

  return (
    <>
      <div className="sticky top-20 md:top-24 z-40 w-full bg-gradient-to-r from-brand-primary to-brand-accent shadow-md">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
              Registros de Ocorrência
            </h1>
            <p className="text-sm text-white/80 mt-1">
              Consulte e gerencie todos os registros do instituto
            </p>
          </div>
          <Link
            href="/registros/novo"
            className="shrink-0 rounded-lg bg-white text-brand-primary px-6 py-2.5 text-sm font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap text-center md:text-left"
          >
            + Novo Registro
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <OccurrenceList
          occurrences={occurrences}
          situacao={situacao}
          busca={busca}
        />
      </div>
    </>
  );
}
