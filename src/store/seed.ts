import type { AppState } from "@/lib/types";
import { todayISO, uid } from "@/lib/format";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

/** Dados iniciais de exemplo, criados na primeira execução. */
export function seedState(): AppState {
  const carteira = uid();
  const corrente = uid();
  const cdb = uid();

  const catSalario = uid();
  const catMercado = uid();
  const catTransporte = uid();
  const catLazer = uid();
  const catMoradia = uid();
  const catRendimento = uid();

  const cartao = uid();

  return {
    accounts: [
      {
        id: carteira,
        name: "Carteira",
        kind: "wallet",
        initialBalance: 180,
        color: "#22c55e",
        yieldType: "none",
        yieldPercent: 0,
        businessDays: false,
        yieldStartDate: todayISO(),
      },
      {
        id: corrente,
        name: "Conta Corrente",
        kind: "bank",
        initialBalance: 2500,
        color: "#38bdf8",
        yieldType: "none",
        yieldPercent: 0,
        businessDays: false,
        yieldStartDate: todayISO(),
      },
      {
        id: cdb,
        name: "CDB 120% CDI",
        kind: "investment",
        initialBalance: 8000,
        color: "#a78bfa",
        yieldType: "cdi",
        yieldPercent: 120,
        businessDays: true,
        yieldStartDate: daysAgo(120),
      },
    ],
    categories: [
      { id: catSalario, name: "Salário", type: "income", color: "#22c55e" },
      { id: catRendimento, name: "Rendimento", type: "income", color: "#14b8a6" },
      { id: catMercado, name: "Mercado", type: "expense", color: "#f59e0b" },
      { id: catTransporte, name: "Transporte", type: "expense", color: "#38bdf8" },
      { id: catLazer, name: "Lazer", type: "expense", color: "#f472b6" },
      { id: catMoradia, name: "Moradia", type: "expense", color: "#fb7185" },
    ],
    cards: [
      {
        id: cartao,
        name: "Cartão Nubank",
        limit: 3000,
        closingDay: 3,
        dueDay: 10,
        debitAccountId: corrente,
        color: "#8b5cf6",
      },
    ],
    transactions: [
      {
        id: uid(),
        accountId: corrente,
        cardId: null,
        type: "income",
        amount: 3200,
        categoryId: catSalario,
        description: "Salário do mês",
        date: daysAgo(12),
        paid: true,
        createdAt: daysAgo(12),
      },
      {
        id: uid(),
        accountId: corrente,
        cardId: null,
        type: "expense",
        amount: 1200,
        categoryId: catMoradia,
        description: "Aluguel",
        date: daysAgo(10),
        paid: true,
        createdAt: daysAgo(10),
      },
      {
        id: uid(),
        accountId: carteira,
        cardId: null,
        type: "expense",
        amount: 46.9,
        categoryId: catTransporte,
        description: "Combustível",
        date: daysAgo(4),
        paid: true,
        createdAt: daysAgo(4),
      },
      {
        id: uid(),
        accountId: null,
        cardId: cartao,
        type: "expense",
        amount: 289.5,
        categoryId: catMercado,
        description: "Compras do mês",
        date: daysAgo(6),
        paid: false,
        createdAt: daysAgo(6),
      },
      {
        id: uid(),
        accountId: null,
        cardId: cartao,
        type: "expense",
        amount: 79.9,
        categoryId: catLazer,
        description: "Streaming + cinema",
        date: daysAgo(2),
        paid: false,
        createdAt: daysAgo(2),
      },
    ],
    rates: null,
  };
}
