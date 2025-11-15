// src/components/forms/sections/necropsy-section.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface NecropsySectionProps {
  control: Control<OccurrenceFormValues>;
  watchedStatusAnimal: "Vivo" | "Morto" | undefined;
  watchedPresencaTumores: "sim" | "nao" | undefined;
}

/**
 * Renderiza a seção "5. Dados de Necropsia".
 * Esta seção está sempre visível, mas desabilitada se o animal estiver "Vivo".
 */
const NecropsySection = ({
  control,
  watchedStatusAnimal,
  watchedPresencaTumores,
}: NecropsySectionProps) => {
  // A seção inteira estará desabilitada se o status não for "Morto"
  const isEnabled = watchedStatusAnimal === "Morto";

  return (
    // Aplicamos 'disabled' no fieldset, que desabilita todos os campos filhos
    <fieldset className="rounded-lg border p-4" disabled={!isEnabled}>
      <legend className="-ml-1 px-1 text-lg font-medium">
        5. Dados de Necropsia (Animal Morto)
      </legend>
      {/* Adicionamos uma sobreposição visual para indicar que está desabilitado */}
      <div
        className={`space-y-6 pt-6 ${
          !isEnabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="responsavelNecropsia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável pela Necropsia</FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      isEnabled ? "Nome do profissional" : "N/A (Animal Vivo)"
                    }
                    {...field}
                    value={field.value ?? ""} // Garante que o campo limpo (undefined) não mostre 'NaN' ou 'null'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="dataObito"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Óbito</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="achadosNecropsia"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Achados de Necropsia</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    isEnabled
                      ? "Descrição detalhada das lesões..."
                      : "N/A (Animal Vivo)"
                  }
                  rows={6}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Lógica condicional para Tumores */}
        <div className="space-y-4">
          <FormField
            control={control}
            name="presencaTumores"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Presença de Tumores</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-4"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="sim" id="tumor_sim" />
                      </FormControl>
                      <Label htmlFor="tumor_sim" className="font-normal">
                        Sim
                      </Label>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="nao" id="tumor_nao" />
                      </FormControl>
                      <Label htmlFor="tumor_nao" className="font-normal">
                        Não
                      </Label>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Este campo SÓ aparece se 'presencaTumores' for 'sim' */}
          {watchedPresencaTumores === "sim" && (
            <FormField
              control={control}
              name="descricaoTumores"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição dos Tumores</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva a localização, tamanho, aparência..."
                      rows={3}
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

        <FormField
          control={control}
          name="causaMortis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Causa Mortis</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    isEnabled ? "Conclusão do laudo..." : "N/A (Animal Vivo)"
                  }
                  rows={3}
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
          name="amostrasPostmortem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amostras Coletadas (Postmortem)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    isEnabled ? "Ex: Tecidos, órgãos..." : "N/A (Animal Vivo)"
                  }
                  rows={3}
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

export default NecropsySection;
