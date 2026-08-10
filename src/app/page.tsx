// src/app/page.tsx
import Link from "next/link";
import {
  listOccurrences,
  type OccurrenceSituacao,
} from "@/lib/actions/occurrence-queries";
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
      <div className="sticky top-20 md:top-24 z-40 w-full bg-white border-b border-brand-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">
              Registros de Ocorrência
            </h1>
            <p className="text-sm text-brand-text-secondary mt-0.5">
              Consulte e gerencie todos os registros do instituto
            </p>
          </div>
          <Link
            href="/registros/novo"
            className="rounded-lg bg-brand-primary text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-primary/90 transition-colors duration-200 shadow-sm"
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
