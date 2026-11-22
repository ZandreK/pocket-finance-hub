import { useEffect } from "react";
import { fetchRates } from "@/lib/bcb";
import { load, save } from "@/lib/storage";
import { useStore } from "@/store/StoreContext";
import type { Rates } from "@/lib/types";

const CACHE_KEY = "rates-cache";
const ONE_DAY = 24 * 60 * 60 * 1000;

/**
 * Carrega as taxas CDI/Selic do Banco Central uma vez por dia e guarda em cache.
 * Mantém o store atualizado para os cálculos de rendimento.
 */
export function useRates() {
  const { state, dispatch } = useStore();

  useEffect(() => {
    const cached = load<Rates | null>(CACHE_KEY, null);
    if (cached && Date.now() - new Date(cached.fetchedAt).getTime() < ONE_DAY) {
      dispatch({ type: "SET_RATES", rates: cached });
      return;
    }
    let active = true;
    fetchRates().then((rates) => {
      if (!active) return;
      save(CACHE_KEY, rates);
      dispatch({ type: "SET_RATES", rates });
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state.rates;
}
