// src/components/registros/occurrence-list.tsx
import Link from "next/link";
import type {
  OccurrenceListItem,
  OccurrenceSituacao,
} from "@/lib/actions/occurrence-queries";

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

function formatDate(date: Date): string {
  // A data é armazenada como @db.Date (UTC, sem hora) — forçar timeZone
  // "UTC" aqui é obrigatório, senão o dia exibido pode ficar um dia
  // atrasado dependendo do fuso do navegador/servidor.
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function OccurrenceList({
  occurrences,
  situacao,
  busca,
}: OccurrenceListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/?situacao=${tab.value}${
              busca ? `&busca=${encodeURIComponent(busca)}` : ""
            }`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              situacao === tab.value
                ? "bg-brand-button-primary-bg text-brand-button-primary-fg"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form method="get" className="flex gap-2">
        <input type="hidden" name="situacao" value={situacao} />
        <input
          type="text"
          name="busca"
          defaultValue={busca}
          placeholder="Buscar por tombo, espécie ou município..."
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-brand-button-primary-bg px-4 py-2 text-sm font-medium text-brand-button-primary-fg"
        >
          Buscar
        </button>
      </form>

      {occurrences.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          Nenhum registro encontrado.
        </p>
      ) : (
        <div className="divide-y rounded-lg border">
          {occurrences.map((occurrence) => (
            <Link
              key={occurrence.id}
              href={`/registros/${occurrence.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted/50"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="font-medium">{occurrence.tomboIma}</span>
                <span className="truncate text-sm italic text-muted-foreground">
                  {occurrence.especie}
                </span>
              </div>
              <span className="shrink-0 text-sm text-muted-foreground">
                {formatDate(occurrence.dataOcorrencia)}
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                  occurrence.destinoFinal
                    ? "bg-slate-100 text-slate-700"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {occurrence.destinoFinal ? "Encerrado" : "Em aberto"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
