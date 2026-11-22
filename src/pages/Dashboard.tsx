import { useState } from "react";
import { Plus, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useStore } from "@/store/StoreContext";
import {
  totalBalance,
  monthTotals,
  accountYield,
} from "@/lib/selectors";
import { formatBRL, formatPercent, todayISO, formatDate } from "@/lib/format";
import { Card, Button, Modal } from "@/components/ui";
import { TransactionForm } from "@/components/TransactionForm";

export default function Dashboard() {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);

  const total = totalBalance(state);
  const month = todayISO().slice(0, 7);
  const { income, expense } = monthTotals(state, month);
  const totalYield = state.accounts.reduce(
    (s, a) => s + accountYield(state, a),
    0,
  );
  const recent = state.transactions.slice(0, 6);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Olá, André 👋</p>
          <h1 className="text-xl font-semibold">Pocket Finance</h1>
        </div>
        <Button onClick={() => setAdding(true)} className="flex items-center gap-1">
          <Plus size={16} /> Lançar
        </Button>
      </header>

      <Card className="bg-gradient-to-br from-brand-700 to-brand-600 text-black">
        <p className="text-sm/none opacity-80">Patrimônio total</p>
        <p className="mt-1 text-3xl font-bold">{formatBRL(total)}</p>
        {totalYield > 0 && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/15 px-2 py-0.5 text-xs font-medium">
            <TrendingUp size={13} /> +{formatBRL(totalYield)} em rendimento
          </p>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="flex items-center gap-1 text-xs text-muted">
            <ArrowUpRight size={14} className="text-brand" /> Entradas (mês)
          </p>
          <p className="mt-1 text-lg font-semibold text-brand">
            {formatBRL(income)}
          </p>
        </Card>
        <Card>
          <p className="flex items-center gap-1 text-xs text-muted">
            <ArrowDownRight size={14} className="text-rose-400" /> Saídas (mês)
          </p>
          <p className="mt-1 text-lg font-semibold text-rose-400">
            {formatBRL(expense)}
          </p>
        </Card>
      </div>

      {state.rates && (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Taxas de hoje · Banco Central</p>
            <p className="text-sm">
              CDI <strong>{formatPercent(state.rates.cdi)}</strong> · Selic{" "}
              <strong>{formatPercent(state.rates.selic)}</strong> a.a.
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] ${
              state.rates.live
                ? "bg-brand/20 text-brand"
                : "bg-amber-500/20 text-amber-300"
            }`}
          >
            {state.rates.live ? "ao vivo" : "offline"}
          </span>
        </Card>
      )}

      <div>
        <h2 className="mb-2 text-sm font-semibold text-muted">
          Últimos lançamentos
        </h2>
        <div className="space-y-2">
          {recent.length === 0 && (
            <p className="text-sm text-muted">Nenhum lançamento ainda.</p>
          )}
          {recent.map((tx) => {
            const cat = state.categories.find((c) => c.id === tx.categoryId);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{tx.description}</p>
                  <p className="text-xs text-muted">
                    {formatDate(tx.date)}
                    {cat ? ` · ${cat.name}` : ""}
                    {tx.cardId ? " · cartão" : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-medium ${
                    tx.type === "income" ? "text-brand" : "text-rose-400"
                  }`}
                >
                  {tx.type === "income" ? "+" : "−"}
                  {formatBRL(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {adding && (
        <Modal title="Novo lançamento" onClose={() => setAdding(false)}>
          <TransactionForm
            onCancel={() => setAdding(false)}
            onSubmit={(tx) => {
              dispatch({ type: "ADD_TX", tx });
              setAdding(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
