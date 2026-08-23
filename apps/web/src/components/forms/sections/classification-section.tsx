"use client";

import { Control, UseFormSetValue } from "react-hook-form";
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
import { useState, useEffect } from "react";
import { useEffectSkipFirst } from "@/hooks/use-effect-skip-first";
import speciesData from "@/data/species-data.json";

interface EspecieInfo {
  especifico: string;
  comum: string;
}
type GeneroData = { [genero: string]: EspecieInfo[] };
type FamiliaData = { [familia: string]: GeneroData };
type OrdemData = { [ordem: string]: FamiliaData };
type SpeciesJson = { [classe: string]: OrdemData };
const typedSpeciesData: SpeciesJson = speciesData;

interface ClassificationSectionProps {
  control: Control<OccurrenceFormValues>;
  setFormValue: UseFormSetValue<OccurrenceFormValues>;
  watchedClasse?:
    | "Aves"
    | "Mammalia"
    | "Reptilia"
    | "Amphibia"
    | "Elasmobranchii";
  watchedOrdem?: string;
  watchedFamilia?: string;
  watchedGenero?: string;
  watchedEspecie?: string;
}

const ClassificationSection = ({
  control,
  setFormValue,
  watchedClasse,
  watchedOrdem,
  watchedFamilia,
  watchedGenero,
  watchedEspecie,
}: ClassificationSectionProps) => {
  const [ordens, setOrdens] = useState<string[]>([]);
  const [familias, setFamilias] = useState<string[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [especies, setEspecies] = useState<EspecieInfo[]>([]);

  // --- useEffects (Lógica de Cascata) ---
  useEffect(() => {
    let ordensData: string[] = [];
    if (watchedClasse && typedSpeciesData[watchedClasse]) {
      ordensData = Object.keys(typedSpeciesData[watchedClasse]).sort();
    }
    setOrdens(ordensData);
  }, [watchedClasse]);

  useEffectSkipFirst(() => {
    setFormValue("ordem", "");
    setFormValue("familia", "");
    setFormValue("genero", "");
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [watchedClasse, setFormValue]);

  useEffect(() => {
    let familiasData: string[] = [];
    if (
      watchedClasse &&
      watchedOrdem &&
      typedSpeciesData[watchedClasse]?.[watchedOrdem]
    ) {
      familiasData = Object.keys(
        typedSpeciesData[watchedClasse][watchedOrdem]
      ).sort();
    }
    setFamilias(familiasData);
  }, [watchedClasse, watchedOrdem]);

  useEffectSkipFirst(() => {
    setFormValue("familia", "");
    setFormValue("genero", "");
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [watchedClasse, watchedOrdem, setFormValue]);

  useEffect(() => {
    let generosData: string[] = [];
    if (
      watchedClasse &&
      watchedOrdem &&
      watchedFamilia &&
      typedSpeciesData[watchedClasse]?.[watchedOrdem]?.[watchedFamilia]
    ) {
      generosData = Object.keys(
        typedSpeciesData[watchedClasse][watchedOrdem][watchedFamilia]
      ).sort();
    }
    setGeneros(generosData);
  }, [watchedClasse, watchedOrdem, watchedFamilia]);

  useEffectSkipFirst(() => {
    setFormValue("genero", "");
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [watchedClasse, watchedOrdem, watchedFamilia, setFormValue]);

  useEffect(() => {
    let especiesData: EspecieInfo[] = [];
    if (
      watchedClasse &&
      watchedOrdem &&
      watchedFamilia &&
      watchedGenero &&
      typedSpeciesData[watchedClasse]?.[watchedOrdem]?.[watchedFamilia]?.[
        watchedGenero
      ]
    ) {
      especiesData =
        typedSpeciesData[watchedClasse][watchedOrdem][watchedFamilia][
          watchedGenero
        ];
    }
    setEspecies(especiesData);
  }, [watchedClasse, watchedOrdem, watchedFamilia, watchedGenero]);

  useEffectSkipFirst(() => {
    setFormValue("especie", "");
    setFormValue("nomeComum", "");
  }, [
    watchedClasse,
    watchedOrdem,
    watchedFamilia,
    watchedGenero,
    setFormValue,
  ]);

  useEffect(() => {
    if (watchedEspecie) {
      const especieInfo = especies.find((e) => e.especifico === watchedEspecie);
      if (especieInfo) {
        setFormValue("nomeComum", especieInfo.comum);
      }
    } else {
      setFormValue("nomeComum", "");
    }
  }, [watchedEspecie, especies, setFormValue]);

  const isAnilhaVisible =
    watchedClasse === "Aves" || watchedClasse === "Reptilia";

  return (
    <fieldset>
      <div className="flex flex-col gap-6">
        {/* === Bloco 1: Taxonomia === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="classe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classe</FormLabel>
                {/* CORREÇÃO: Removido defaultValue={field.value} */}
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(typedSpeciesData).map((classeNome) => (
                      <SelectItem key={classeNome} value={classeNome}>
                        {classeNome}
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
            name="ordem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordem</FormLabel>
                {/* CORREÇÃO: Removido defaultValue */}
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={ordens.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a classe antes..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ordens.map((ordemNome) => (
                      <SelectItem key={ordemNome} value={ordemNome}>
                        {ordemNome}
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
            name="familia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Família</FormLabel>
                {/* CORREÇÃO: Removido defaultValue */}
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={familias.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a ordem antes..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {familias.map((familiaNome) => (
                      <SelectItem key={familiaNome} value={familiaNome}>
                        {familiaNome}
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
            name="genero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gênero</FormLabel>
                {/* CORREÇÃO: Removido defaultValue */}
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={generos.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a família antes..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {generos.map((generoNome) => (
                      <SelectItem key={generoNome} value={generoNome}>
                        {generoNome}
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
            name="especie"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Espécie</FormLabel>
                {/* CORREÇÃO: Removido defaultValue */}
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={especies.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o gênero antes..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {especies.map((esp) => (
                      <SelectItem key={esp.especifico} value={esp.especifico}>
                        {esp.especifico}
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
            name="nomeComum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Comum</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Preenchimento automático..."
                    {...field}
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* === Bloco 2: Características === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="sexo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  {/* CORREÇÃO: Removido defaultValue */}
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M">Macho</SelectItem>
                      <SelectItem value="F">Fêmea</SelectItem>
                      <SelectItem value="IN">Indefinido</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          <div>
            <FormField
              control={control}
              name="faixaEtaria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa Etária</FormLabel>
                  {/* CORREÇÃO: Removido defaultValue */}
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="feto">Feto</SelectItem>
                      <SelectItem value="filhote">Filhote</SelectItem>
                      <SelectItem value="juvenil">Juvenil</SelectItem>
                      <SelectItem value="subadulto">Subadulto</SelectItem>
                      <SelectItem value="adulto">Adulto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Anilha (Desabilitada) */}
           <div className={`${
                isAnilhaVisible ? "md:visible" : "md:hidden"
            }`}
           >
          <FormField
            control={control}
            name="anilhaNumero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anilha / Tag Nº</FormLabel>
                <FormControl>
                  <Input
                    placeholder={"Digite o número..."}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
        </div>
      </div>
    </fieldset>
  );
};

export default ClassificationSection;
