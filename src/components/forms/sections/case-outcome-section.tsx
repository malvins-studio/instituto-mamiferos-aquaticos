// src/components/forms/sections/case-outcome-section.tsx
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CaseOutcomeSectionProps {
  control: Control<OccurrenceFormValues>;
  watchedDestinoFinal: OccurrenceFormValues["destinoFinal"];
}

const CaseOutcomeSection = ({
  control,
  watchedDestinoFinal,
}: CaseOutcomeSectionProps) => {
  return (
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        7. Desfecho do Caso (Opcional)
      </legend>
      <div className="space-y-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Peso Final */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="pesoFinal"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Peso Final</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 1.5"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="pesoFinalUnidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Destino Final */}
          <div className="space-y-4">
            <FormField
              control={control}
              name="destinoFinal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destino Final do Exemplar</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o destino..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="soltura">Soltura</SelectItem>
                      <SelectItem value="transferencia">
                        Transferência
                      </SelectItem>
                      <SelectItem value="obito">Óbito</SelectItem>
                      <SelectItem value="colecao_cientifica">
                        Coleção Científica
                      </SelectItem>
                      <SelectItem value="enterro">Enterro</SelectItem>
                      <SelectItem value="incineracao">Incineração</SelectItem>
                      <SelectItem value="maceracao">Maceração</SelectItem>
                      <SelectItem value="doacao">Doação</SelectItem>
                      <SelectItem value="colecao cientifica IMA">
                        Coleção Científica IMA
                      </SelectItem>
                      <SelectItem value="outro">Outro (especificar)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedDestinoFinal === "outro" && (
              <FormField
                control={control}
                name="outroDestinoEspecificar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especifique o destino</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o destino final..."
                        rows={2}
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        <FormField
          control={control}
          name="dataSaida"
          render={({ field }) => (
            <FormItem className="w-full md:w-1/2">
              <FormLabel>Data da Saída</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações Finais</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Qualquer informação adicional relevante sobre o desfecho do caso..."
                  rows={5}
                  {...field}
                  value={field.value ?? ""}
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

export default CaseOutcomeSection;
