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
              Editar Registro
            </h1>
            <p className="text-sm text-white/80 mt-1 truncate">
              {occurrence.tomboIma} • {occurrence.especie}
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl bg-white p-6 md:p-8 rounded-xl border-2 border-brand-accent/30 shadow-lg">
          <OccurrenceForm
            initialValues={initialValues}
            occurrenceId={occurrence.id}
          />
        </div>
      </div>
    </>
  );
}
