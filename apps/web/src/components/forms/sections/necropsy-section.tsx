// src/components/forms/sections/necropsy-section.tsx
"use client";

import { Control } from "react-hook-form";
import type { OccurrenceFormValues } from "@siima/shared";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface NecropsySectionProps {
  control: Control<OccurrenceFormValues>;
  watchedStatusAnimal: "Vivo" | "Morto" | undefined;
  watchedPresencaTumores: "sim" | "nao" | undefined;
}

/**
 * Renderiza a seção "Dados de Necropsia".
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
    <fieldset disabled={!isEnabled}>
      <div className={`space-y-6 ${!isEnabled ? "opacity-50" : ""}`}>
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
                      isEnabled
                        ? "Nome e CRMV do veterinário"
                        : "N/A (Animal Vivo)"
                    }
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
                      ? "Principais achados macroscópicos..."
                      : "N/A (Animal Vivo)"
                  }
                  rows={5}
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
                    disabled={!isEnabled}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="tumor_sim" />
                      <Label htmlFor="tumor_sim" className="font-normal">
                        Sim
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="tumor_nao" />
                      <Label htmlFor="tumor_nao" className="font-normal">
                        Não
                      </Label>
                    </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="causaMortisCategoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Causa Mortis (Categoria)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={!isEnabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isEnabled ? "Selecione a categoria..." : "N/A"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Antrópica">
                      Antrópica (Ação humana)
                    </SelectItem>
                    <SelectItem value="Patológica">
                      Patológica (Doenças)
                    </SelectItem>
                    <SelectItem value="Fisiológica">
                      Fisiológica (Estresse, exaustão)
                    </SelectItem>
                    <SelectItem value="Desconhecida">
                      Desconhecida (Sem necropsia)
                    </SelectItem>
                    <SelectItem value="Indeterminada">
                      Indeterminada (Inconclusiva)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="causaMortisDiagnostico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diagnóstico da Causa Mortis</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      isEnabled ? "Descreva o diagnóstico detalhado..." : "N/A"
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

        <FormField
          control={control}
          name="amostrasPostmortem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amostras Coletadas (Postmortem)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    isEnabled ? "Ex: Tecidos, órgãos para análise..." : "N/A"
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
