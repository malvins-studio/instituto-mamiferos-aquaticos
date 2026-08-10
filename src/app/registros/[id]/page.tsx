import Link from "next/link";
import { notFound } from "next/navigation";
import { getOccurrence } from "@/lib/actions/occurrence-queries";
import { toOccurrenceFormValues } from "@/lib/actions/occurrence-mappers";
import { OccurrenceForm } from "@/components/forms/occurrence-form";

export default async function EditarRegistroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const occurrence = await getOccurrence(id);

  if (!occurrence) {
    notFound();
  }

  const initialValues = toOccurrenceFormValues(occurrence);

  return (
    <>
      <div className="sticky top-20 md:top-24 z-40 w-full bg-white border-b border-brand-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-brand-primary hover:text-brand-accent transition-colors"
          >
            ← Voltar
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-primary">
              Editar Registro
            </h1>
            <p className="text-sm text-brand-text-secondary mt-0.5">
              {occurrence.tomboIma} • {occurrence.especie}
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl bg-white p-6 md:p-8 rounded-lg border border-brand-border shadow-sm">
          <OccurrenceForm
            initialValues={initialValues}
            occurrenceId={occurrence.id}
          />
        </div>
      </div>
    </>
  );
}
