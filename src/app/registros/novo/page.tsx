import { OccurrenceForm } from "@/components/forms/occurrence-form";

export default function NovoRegistroPage() {
  return (
    <>
      <div className="sticky top-20 md:top-24 z-40 w-full border-b bg-background shadow-sm">
        <div className="container mx-auto flex h-14 items-center px-4">
          <h1 className="text-xl font-bold tracking-tight text-brand-title-bar-fg">
            Novo Registro
          </h1>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="bg-card p-6 md:p-8 rounded-lg border shadow-md">
          <OccurrenceForm />
        </div>
      </div>
    </>
  );
}
