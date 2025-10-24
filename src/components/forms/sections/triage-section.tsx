// src/components/forms/sections/triage-section.tsx
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TriageSectionProps {
  control: Control<OccurrenceFormValues>;
}

const TriageSection = ({ control }: TriageSectionProps) => {
  return (
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        2. Triagem e status do animal
      </legend>
      <div className="space-y-6 pt-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <SelectItem value="Pronto Atendimento">Pronto atendimento</SelectItem>
                    <SelectItem value="Repasse por terceiros">Repasse por terceiros</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        {/* O 'value' aqui já estava correto */}
                        <RadioGroupItem value="Vivo" id="status_vivo" />
                      </FormControl>
                      <Label htmlFor="status_vivo" className="font-normal">Vivo</Label>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="Morto" id="status_morto" />
                      </FormControl>
                      <Label htmlFor="status_morto" className="font-normal">Morto</Label>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  <SelectItem value="Resgate e Reabilitação">Resgate e Reabilitação</SelectItem>
                  <SelectItem value="Coleta">Coleta</SelectItem>
                  <SelectItem value="Registro">Registro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="codeDecomposicao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CODE (Decomposição)</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="5" placeholder="1-5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>         
                        <RadioGroupItem value="Sim" id="pesca_sim" />
                      </FormControl>
                      <Label htmlFor="pesca_sim" className="font-normal">Sim</Label>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="Nao" id="pesca_nao" />
                      </FormControl>
                      <Label htmlFor="pesca_nao" className="font-normal">Não</Label>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </fieldset>
  );
};

export default TriageSection;