// src/components/forms/sections/identification-section.tsx
"use client";

import { Control, UseFormSetValue } from "react-hook-form";
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

import { useState, useEffect } from "react";
import localidadesData from "@/data/location-data.json";

interface IdentificationSectionProps {
  control: Control<OccurrenceFormValues>;
  watchedUf: string | undefined;
  setFormValue: UseFormSetValue<OccurrenceFormValues>;
}

interface Estado {
  uf: string;
  nome: string;
  municipios: string[];
}

const IdentificationSection = ({
  control,
  watchedUf,
  setFormValue,
}: IdentificationSectionProps) => {
  const estados: Estado[] = localidadesData.estados;

  const [municipios, setMunicipios] = useState<string[]>([]);

  useEffect(() => {
    if (watchedUf) {
      const estadoSelecionado = estados.find((e) => e.uf === watchedUf);
      setMunicipios(estadoSelecionado ? estadoSelecionado.municipios : []);

      setFormValue("municipio", "");
    } else {
      setMunicipios([]);
      setFormValue("municipio", "");
    }
  }, [watchedUf, setFormValue, estados]);

  return (
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        1. Identificação e local da ocorrência
      </legend>
      <div className="space-y-6 pt-6">
        <FormField
          control={control}
          name="tomboIma"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tombo IMA</FormLabel>
              <FormControl>
                <Input placeholder="Ex: IMA03459" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="responsavelRegistro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável pelo registro</FormLabel>
              <FormControl>
                {/* TODO: Preencher automaticamente com usuário logado no futuro */}
                <Input placeholder="Nome completo do responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="dataOcorrencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da ocorrência</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="horarioColeta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário da coleta</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="uf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UF (Estado)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estado..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {estados.map((estado) => (
                      <SelectItem key={estado.uf} value={estado.uf}>
                        {estado.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="municipio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Município</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={municipios.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um município..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {municipios.map((municipio) => (
                      <SelectItem key={municipio} value={municipio}>
                        {municipio}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="localEspecifico"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local específico</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o local exato (distrito, bairro, vila, praia...)"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                {/* TODO: Adicionar botão "Obter Localização Atual" */}
                <FormControl>
                  <Input placeholder="Ex: -15.080192" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: -38.996538" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campo de Foto (Placeholder para o futuro) */}
        <FormItem>
          <FormLabel>Foto</FormLabel>
          <FormControl>
            <Input type="file" disabled className="cursor-not-allowed" />
          </FormControl>
          <FormMessage />
          {/* TODO: Implementar lógica de upload e preview */}
        </FormItem>
      </div>
    </fieldset>
  );
};

export default IdentificationSection;
