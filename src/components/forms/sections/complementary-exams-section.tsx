// src/components/forms/sections/complementary-exams-section.tsx
"use client";

import { Control } from "react-hook-form";
import { OccurrenceFormValues } from "@/lib/schemas/occurrenceSchema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface ComplementaryExamsSectionProps {
  control: Control<OccurrenceFormValues>;
}

/**
 * Renderiza a seção "Resultados de Exames Complementares".
 * Esta seção está sempre visível e os seus campos são opcionais.
 */
const ComplementaryExamsSection = ({
  control,
}: ComplementaryExamsSectionProps) => {
  return (
    <fieldset>
      <div className="space-y-6">
        <FormField
          control={control}
          name="resultadoRadiografia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resultado da Radiografia</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva os achados radiográficos..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="resultadoToxicologico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resultado Toxicológico</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Resultados da análise toxicológica, se houver..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="resultadoHistopatologico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resultado Histopatológico</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Achados da análise de tecidos..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="achadosBioquimica"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Achados de Bioquímica</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Resultados dos exames bioquímicos..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="achadosHemograma"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Achados do Hemograma</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Resultados do hemograma completo..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="achadosFezesUrina"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Achados de Fezes/Urina</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Resultados de coproparasitológico, urinálise, etc..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="resultadoMicrobiologico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resultado Microbiológico</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Resultados de culturas, antibiograma, etc..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </fieldset>
  );
};

export default ComplementaryExamsSection;
