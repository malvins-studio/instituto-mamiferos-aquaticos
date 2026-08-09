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
      <div className="sticky top-20 md:top-24 z-40 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <h1 className="text-xl font-bold tracking-tight text-brand-title-bar-fg">
            Registros de Ocorrência
          </h1>
          <Link
            href="/registros/novo"
            className="rounded-md bg-brand-button-primary-bg px-4 py-2 text-sm font-medium text-brand-button-primary-fg hover:bg-brand-button-primary-bg/90"
          >
            Novo Registro
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <OccurrenceList
          occurrences={occurrences}
          situacao={situacao}
          busca={busca}
        />
      </div>
    </>
  );
}
