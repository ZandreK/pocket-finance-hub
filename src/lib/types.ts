export type YieldType = "none" | "cdi" | "selic" | "fixed_year" | "fixed_month";

export interface Account {
  id: string;
  name: string;
  kind: "wallet" | "bank" | "savings" | "investment";
  initialBalance: number;
  color: string;
  /** Rendimento */
  yieldType: YieldType;
  /** % do CDI/Selic (ex: 120) ou % a.a./a.m. quando fixo (ex: 12) */
  yieldPercent: number;
  /** true = 252 dias úteis/ano (CDB/LCI); false = 365 dias corridos (poupança) */
  businessDays: boolean;
  /** Data a partir da qual o rendimento é contado (ISO yyyy-mm-dd) */
  yieldStartDate: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  /** Conta usada por padrão para pagar a fatura */
  debitAccountId: string | null;
  color: string;
}

export interface Transaction {
  id: string;
  accountId: string | null;
  /** Se preenchido, é um gasto no cartão de crédito (entra na fatura) */
  cardId: string | null;
  type: "income" | "expense";
  amount: number;
  categoryId: string | null;
  description: string;
  /** ISO yyyy-mm-dd */
  date: string;
  /** Para gastos de cartão: se a fatura já foi paga */
  paid: boolean;
  createdAt: string;
}

export interface Rates {
  /** CDI anualizado (% a.a., base 252) — série BCB/SGS 4389 */
  cdi: number;
  /** Meta Selic anualizada (% a.a.) — série BCB/SGS 432 */
  selic: number;
  /** ISO datetime da última atualização */
  fetchedAt: string;
  /** true quando veio da API; false quando é fallback offline */
  live: boolean;
}

export interface AppState {
  accounts: Account[];
  categories: Category[];
  cards: CreditCard[];
  transactions: Transaction[];
  rates: Rates | null;
}
