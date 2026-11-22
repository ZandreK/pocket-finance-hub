import type { Account, Rates } from "./types";

/** Conta quantos dias úteis (seg–sex) existem entre duas datas, exclusivo no fim. */
export function businessDaysBetween(startISO: string, endISO: string): number {
  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  if (end <= start) return 0;
  let count = 0;
  const cur = new Date(start);
  while (cur < end) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

export function calendarDaysBetween(startISO: string, endISO: string): number {
  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  const ms = end.getTime() - start.getTime();
  return ms > 0 ? Math.floor(ms / 86400000) : 0;
}

/** Taxa anual efetiva (% a.a.) de uma conta, dadas as taxas de mercado. */
export function annualRateFor(account: Account, rates: Rates | null): number {
  const cdi = rates?.cdi ?? 0;
  const selic = rates?.selic ?? 0;
  switch (account.yieldType) {
    case "cdi":
      return (cdi * account.yieldPercent) / 100;
    case "selic":
      return (selic * account.yieldPercent) / 100;
    case "fixed_year":
      return account.yieldPercent;
    case "fixed_month":
      // converte % a.m. para % a.a. compostos
      return (Math.pow(1 + account.yieldPercent / 100, 12) - 1) * 100;
    default:
      return 0;
  }
}

/**
 * Rendimento acumulado (em R$) de uma conta desde yieldStartDate até hoje,
 * aplicado sobre o saldo informado. Usa base 252 (dias úteis) ou 365 (corridos).
 */
export function accruedYield(
  account: Account,
  balance: number,
  rates: Rates | null,
  todayISO: string,
): number {
  if (account.yieldType === "none" || balance <= 0) return 0;
  const annual = annualRateFor(account, rates);
  if (annual <= 0) return 0;

  const base = account.businessDays ? 252 : 365;
  const elapsed = account.businessDays
    ? businessDaysBetween(account.yieldStartDate, todayISO)
    : calendarDaysBetween(account.yieldStartDate, todayISO);
  if (elapsed <= 0) return 0;

  const dailyRate = Math.pow(1 + annual / 100, 1 / base) - 1;
  const factor = Math.pow(1 + dailyRate, elapsed) - 1;
  return balance * factor;
}
