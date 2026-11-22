import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@/store/StoreContext";
import { formatBRL, formatDate } from "@/lib/format";
import { Card, Button, Modal } from "@/components/ui";
import { TransactionForm } from "@/components/TransactionForm";

type Filter = "all" | "income" | "expense";

export default function Transactions() {
  const { state, dispatch } = useStore();
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => {
    return state.transactions
      .filter((t) => (filter === "all" ? true : t.type === filter))
      .slice()
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [state.transactions, filter]);

  const name = (id: string | null, kind: "acc" | "cat") => {
    if (!id) return "";
    if (kind === "acc")
      return state.accounts.find((a) => a.id === id)?.name ?? "";
    return state.categories.find((c) => c.id === id)?.name ?? "";
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lançamentos</h1>
        <Button onClick={() => setAdding(true)} className="flex items-center gap-1">
          <Plus size={16} /> Novo
        </Button>
      </header>

      <div className="flex gap-2">
        {(["all", "income", "expense"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs ${
              filter === f ? "bg-brand text-black" : "bg-surface-2 text-muted"
            }`}
          >
            {f === "all" ? "Todos" : f === "income" ? "Entradas" : "Saídas"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {list.length === 0 && (
          <p className="text-sm text-muted">Nenhum lançamento.</p>
        )}
        {list.map((tx) => (
          <Card key={tx.id} className="flex items-center justify-between py-3">
            <div className="min-w-0">
              <p className="truncate text-sm">{tx.description}</p>
              <p className="text-xs text-muted">
                {formatDate(tx.date)}
                {tx.cardId ? " · cartão" : ` · ${name(tx.accountId, "acc")}`}
                {tx.categoryId ? ` · ${name(tx.categoryId, "cat")}` : ""}
                {tx.cardId && !tx.paid ? " · em aberto" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  tx.type === "income" ? "text-brand" : "text-rose-400"
                }`}
              >
                {tx.type === "income" ? "+" : "−"}
                {formatBRL(tx.amount)}
              </span>
              <button
                onClick={() => dispatch({ type: "DELETE_TX", id: tx.id })}
                className="text-muted hover:text-rose-400"
                aria-label="Excluir"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </Card>
        ))}
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
