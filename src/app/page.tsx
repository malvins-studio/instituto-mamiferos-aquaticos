// src/app/page.tsx
import { OccurrenceForm } from "@/components/forms/occurrence-form";
import Header from "@/components/layout/header";

export default function Home() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 pt-56 pb-12">
        <OccurrenceForm />
      </main>
    </>
  );
}