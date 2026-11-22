import type { AppState, Account } from "./types";
import { accruedYield } from "./yield";
import { todayISO } from "./format";

/** Saldo "nominal" da conta: saldo inicial + entradas − saídas (exclui cartão). */
export function accountBalance(state: AppState, accountId: string): number {
  const acc = state.accounts.find((a) => a.id === accountId);
  if (!acc) return 0;
  let balance = acc.initialBalance;
  for (const tx of state.transactions) {
    if (tx.accountId !== accountId || tx.cardId) continue;
    balance += tx.type === "income" ? tx.amount : -tx.amount;
  }
  return balance;
}

/** Rendimento acumulado da conta até hoje. */
export function accountYield(state: AppState, account: Account): number {
  return accruedYield(account, accountBalance(state, account.id), state.rates, todayISO());
}

/** Saldo atual = saldo nominal + rendimento acumulado. */
export function accountCurrentBalance(state: AppState, account: Account): number {
  return accountBalance(state, account.id) + accountYield(state, account);
}

/** Patrimônio total (todas as contas, já com rendimento). */
export function totalBalance(state: AppState): number {
  return state.accounts.reduce((sum, acc) => sum + accountCurrentBalance(state, acc), 0);
}

/** Valor da fatura aberta do cartão (gastos não pagos). */
export function cardInvoice(state: AppState, cardId: string): number {
  return state.transactions
    .filter((tx) => tx.cardId === cardId && !tx.paid)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

/** Limite disponível do cartão. */
export function cardAvailable(state: AppState, cardId: string): number {
  const card = state.cards.find((c) => c.id === cardId);
  if (!card) return 0;
  return card.limit - cardInvoice(state, cardId);
}

/** Totais de entradas e saídas de um mês (yyyy-mm), considerando contas. */
export function monthTotals(state: AppState, monthPrefix: string) {
  let income = 0;
  let expense = 0;
  for (const tx of state.transactions) {
    if (!tx.date.startsWith(monthPrefix) || tx.cardId) continue;
    if (tx.type === "income") income += tx.amount;
    else expense += tx.amount;
  }
  return { income, expense, net: income - expense };
}
