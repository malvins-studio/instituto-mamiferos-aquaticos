import type { OccurrenceFormValues } from "@siima/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type OccurrenceSituacao = "aberto" | "encerrado" | "todos";

export type OccurrenceListItem = {
  id: string;
  tomboIma: string;
  especie: string;
  nomeComum: string | null;
  dataOcorrencia: string;
  destinoFinal: string | null;
};

export type CreateOccurrenceResult =
  | { success: true; id: string }
  | { success: false; errors: Record<string, string> };

export async function listOccurrences(params: {
  situacao?: OccurrenceSituacao;
  busca?: string;
}): Promise<OccurrenceListItem[]> {
  const search = new URLSearchParams();
  if (params.situacao) search.set("situacao", params.situacao);
  if (params.busca) search.set("busca", params.busca);

  const response = await fetch(`${API_URL}/occurrences?${search.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os registros.");
  }

  return response.json();
}

export async function getOccurrence(
  id: string
): Promise<OccurrenceFormValues | null> {
  const response = await fetch(`${API_URL}/occurrences/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar o registro.");
  }

  return response.json();
}

export async function createOccurrence(
  values: OccurrenceFormValues
): Promise<CreateOccurrenceResult> {
  const response = await fetch(`${API_URL}/occurrences`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Não foi possível salvar o registro.");
  }

  return response.json();
}

export async function updateOccurrence(
  id: string,
  values: OccurrenceFormValues
): Promise<CreateOccurrenceResult> {
  const response = await fetch(`${API_URL}/occurrences/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error("Não foi possível salvar o registro.");
  }

  return response.json();
}
