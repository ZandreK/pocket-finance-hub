import type { Rates } from "./types";

/**
 * Integração com a API pública do Banco Central do Brasil (SGS).
 * Gratuita, sem chave. Retorna a última taxa anualizada (% a.a.) de:
 *   - CDI   → série 4389 (CDI anualizada base 252)
 *   - Selic → série 432  (Meta Selic definida pelo Copom)
 *
 * Doc: https://dadosabertos.bcb.gov.br/dataset/4389-taxa-de-juros-cdi-anualizada
 */
const SGS = (code: number) =>
  `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados/ultimos/1?formato=json`;

// Fallback usado apenas se a API estiver indisponível (valores de referência).
const FALLBACK: Omit<Rates, "fetchedAt" | "live"> = { cdi: 13.65, selic: 13.75 };

async function fetchSeries(code: number): Promise<number | null> {
  try {
    const res = await fetch(SGS(code), { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data: Array<{ data: string; valor: string }> = await res.json();
    const last = data[data.length - 1];
    const value = Number(last?.valor?.replace(",", "."));
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export async function fetchRates(): Promise<Rates> {
  const [cdi, selic] = await Promise.all([fetchSeries(4389), fetchSeries(432)]);
  const live = cdi !== null && selic !== null;
  return {
    cdi: cdi ?? FALLBACK.cdi,
    selic: selic ?? FALLBACK.selic,
    fetchedAt: new Date().toISOString(),
    live,
  };
}
