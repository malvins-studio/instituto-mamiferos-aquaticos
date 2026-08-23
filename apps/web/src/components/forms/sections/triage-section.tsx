// src/components/forms/sections/triage-section.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TriageSectionProps {
  control: Control<OccurrenceFormValues>;
  watchedStatusAnimal: OccurrenceFormValues["statusAnimal"];
  watchedInteracaoPesca: OccurrenceFormValues["interacaoPesca"];
}

const TriageSection = ({
  control,
  watchedStatusAnimal,
  watchedInteracaoPesca,
}: TriageSectionProps) => {
  return (
    <fieldset>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* === COLUNA ESQUERDA === */}
        <div className="space-y-6">
          <FormField
            control={control}
            name="tipoEntrada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de entrada</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de entrada..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Entrega voluntária">
                      Entrega voluntária
                    </SelectItem>
                    <SelectItem value="Repasse por terceiros">
                      Repasse por terceiros
                    </SelectItem>
                    <SelectItem value="Pronto Atendimento">
                      Pronto Atendimento
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="classificacaoOcorrencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classificação da ocorrência</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a classificação..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Resgate e Reabilitação">
                      Resgate e Reabilitação
                    </SelectItem>
                    <SelectItem value="Coleta">Coleta</SelectItem>
                    <SelectItem value="Registro">Registro</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Encalhe">Encalhe</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* === COLUNA DIREITA === */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={control}
              name="statusAnimal"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status do animal</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex items-center space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Vivo" id="status_vivo" />
                        <Label htmlFor="status_vivo" className="font-normal">
                          Vivo
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Morto" id="status_morto" />
                        <Label htmlFor="status_morto" className="font-normal">
                          Morto
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="codeDecomposicao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CODE (Decomposição)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      placeholder={
                        watchedStatusAnimal === "Morto" ? "2-5" : "1 (Vivo)"
                      }
                      disabled={watchedStatusAnimal === "Vivo"}
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
            name="interacaoPesca"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Sinais de Interação com a Pesca</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Sim" id="pesca_sim" />
                      <Label htmlFor="pesca_sim" className="font-normal">
                        Sim
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Nao" id="pesca_nao" />
                      <Label htmlFor="pesca_nao" className="font-normal">
                        Não
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchedInteracaoPesca === "Sim" && (
            <FormField
              control={control}
              name="interacaoPescaDescricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição da Interação com a Pesca</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrever sinais, marcas de rede, petrechos, etc..."
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
      </div>
    </fieldset>
  );
};

export default TriageSection;
