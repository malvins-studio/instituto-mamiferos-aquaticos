// src/components/registros/occurrence-list.tsx
import Link from "next/link";
import { Search } from "lucide-react";
import type { OccurrenceListItem, OccurrenceSituacao } from "@/services/api";

interface OccurrenceListProps {
  occurrences: OccurrenceListItem[];
  situacao: OccurrenceSituacao;
  busca: string;
}

const TABS: { value: OccurrenceSituacao; label: string }[] = [
  { value: "aberto", label: "Em aberto" },
  { value: "encerrado", label: "Encerrados" },
  { value: "todos", label: "Todos" },
];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function OccurrenceList({
  occurrences,
  situacao,
  busca,
}: OccurrenceListProps) {
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/?situacao=${tab.value}${
                busca ? `&busca=${encodeURIComponent(busca)}` : ""
              }`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                situacao === tab.value
                  ? "bg-brand-primary text-white shadow-md"
                  : "bg-brand-bg-secondary text-brand-text-secondary hover:bg-brand-border"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Busca */}
        <form method="get" className="flex gap-2">
          <input type="hidden" name="situacao" value={situacao} />
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-brand-text-secondary" />
            <input
              type="text"
              name="busca"
              defaultValue={busca}
              placeholder="Buscar por tombo, espécie ou município..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-brand-border bg-white text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors duration-200 shadow-sm"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Lista de Registros */}
      {occurrences.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-brand-text-secondary text-base">
            Nenhum registro encontrado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {occurrences.map((occurrence) => (
            <Link
              key={occurrence.id}
              href={`/registros/${occurrence.id}`}
              className="block rounded-xl border-2 border-brand-accent/30 bg-gradient-to-br from-white to-blue-50/50 p-4 transition-all duration-200 hover:shadow-lg hover:border-brand-accent/50 hover:from-white hover:to-blue-100/50 group overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-primary to-brand-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 mb-2">
                    <h3 className="text-lg font-bold text-brand-primary group-hover:text-brand-accent transition-colors">
                      {occurrence.tomboIma}
                    </h3>
                    <span className="text-sm text-brand-text-secondary">
                      {formatDate(occurrence.dataOcorrencia)}
                    </span>
                  </div>
                  <p className="text-sm italic text-brand-text-secondary">
                    {occurrence.especie}
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    occurrence.destinoFinal
                      ? "bg-brand-status-success/15 text-brand-status-success"
                      : "bg-brand-status-warning/15 text-brand-status-warning"
                  }`}
                >
                  {occurrence.destinoFinal ? "Encerrado" : "Em aberto"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
