// src/components/forms/sections/classification-section.tsx
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
import { useState, useEffect } from "react";
import speciesData from "@/data/species-data.json";

// --- INÍCIO DA TIPIFICAÇÃO SEGURA ---
interface EspecieInfo {
  especifico: string;
  comum: string;
}
type GeneroData = { [genero: string]: EspecieInfo[] };
type FamiliaData = { [familia: string]: GeneroData };
type OrdemData = { [ordem: string]: FamiliaData };
type SpeciesJson = { [classe: string]: OrdemData };
const typedSpeciesData: SpeciesJson = speciesData;
// --- FIM DA TIPIFICAÇÃO SEGURA ---

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
  // Estados locais para as listas
  const [ordens, setOrdens] = useState<string[]>([]);
  const [familias, setFamilias] = useState<string[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [especies, setEspecies] = useState<EspecieInfo[]>([]);

  // --- LÓGICA DOS useEffects (Sem alterações) ---
  useEffect(() => {
    let ordensData: string[] = [];
    if (watchedClasse && typedSpeciesData[watchedClasse]) {
      ordensData = Object.keys(typedSpeciesData[watchedClasse]).sort();
    }
    setOrdens(ordensData);
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
  // --- FIM DA LÓGICA ---

  // Determina se o campo Anilha/Tag estará visível
  const isAnilhaVisible =
    watchedClasse === "Aves" || watchedClasse === "Reptilia";

  return (
    <fieldset className="rounded-lg border p-4">
      <legend className="-ml-1 px-1 text-lg font-medium">
        3. Classificação biológica
      </legend>
      {/* Container principal da seção com espaçamento vertical entre os blocos */}
      <div className="flex flex-col gap-6 pt-6">
        {/* ========================================================== */}
        {/* === Bloco 1: Taxonomia (Grid 1x3) ===                      */}
        {/* ========================================================== */}
        {/* 'grid-cols-1' (mobile 1-em-1) e 'md:grid-cols-3' (desktop 3 colunas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="classe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Classe</FormLabel>
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={ordens.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={familias.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={generos.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                  disabled={especies.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {especies.map((esp) => (
                      <SelectItem key={esp.especifico} value={esp.especifico}>
                        {`${esp.especifico} (${esp.comum})`}
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
                    placeholder="Preenchido automaticamente..."
                    {...field}
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>{" "}
        {/* ========================================================== */}
        {/* === Bloco 2: Características (Layout Corrigido) ===        */}
        {/* ========================================================== */}
        {/* Renderização Condicional do Layout */}
        {isAnilhaVisible ? (
          /* --- SE ANILHA VISÍVEL: Renderiza um grid de 3 colunas (alinha com o bloco de cima) --- */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={control}
              name="sexo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
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
                      <SelectItem value="sexo_macho">Macho</SelectItem>
                      <SelectItem value="sexo_femea">Fêmea</SelectItem>
                      <SelectItem value="sexo_indefinido">
                        Indefinido
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="faixaEtaria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Faixa Etária</FormLabel>
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
                      <SelectItem value="faixa_filhote">Filhote</SelectItem>
                      <SelectItem value="faixa_juvenil">Juvenil</SelectItem>
                      <SelectItem value="faixa_subadulto">Subadulto</SelectItem>
                      <SelectItem value="faixa_adulto">Adulto</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="anilhaNumero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anilha / Tag Nº</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o número..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ) : (
          /* --- SE ANILHA OCULTA: Renderiza um grid de 2 colunas CENTRALIZADO --- */
          // 1. Wrapper Flex para centralizar o conteúdo no desktop
          <div className="flex justify-center">
            {/* 2. Grid interno que ocupa 2/3 da largura no desktop, alinhando-se visualmente com o grid de cima */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full md:w-2/3">
              <FormField
                control={control}
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo</FormLabel>
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
                        <SelectItem value="sexo_macho">Macho</SelectItem>
                        <SelectItem value="sexo_femea">Fêmea</SelectItem>
                        <SelectItem value="sexo_indefinido">
                          Indefinido
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="faixaEtaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faixa Etária</FormLabel>
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
                        <SelectItem value="faixa_filhote">Filhote</SelectItem>
                        <SelectItem value="faixa_juvenil">Juvenil</SelectItem>
                        <SelectItem value="faixa_subadulto">
                          Subadulto
                        </SelectItem>
                        <SelectItem value="faixa_adulto">Adulto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}{" "}
        {/* Fim do Bloco 2 (Condicional) */}
      </div>
    </fieldset>
  );
};

export default ClassificationSection;
