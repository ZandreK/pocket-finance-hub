import { useState } from "react";
import { Plus, Pencil, Trash2, TrendingUp } from "lucide-react";
import { useStore } from "@/store/StoreContext";
import type { Account } from "@/lib/types";
import {
  accountBalance,
  accountCurrentBalance,
  accountYield,
} from "@/lib/selectors";
import { annualRateFor } from "@/lib/yield";
import { formatBRL, formatPercent } from "@/lib/format";
import { Card, Button, Modal } from "@/components/ui";
import { AccountForm } from "@/components/AccountForm";

export default function Accounts() {
  const { state, dispatch } = useStore();
  const [editing, setEditing] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contas & Carteiras</h1>
        <Button onClick={() => setCreating(true)} className="flex items-center gap-1">
          <Plus size={16} /> Nova
        </Button>
      </header>

      <div className="space-y-3">
        {state.accounts.map((acc) => {
          const nominal = accountBalance(state, acc.id);
          const rend = accountYield(state, acc);
          const current = accountCurrentBalance(state, acc);
          const annual = annualRateFor(acc, state.rates);
          return (
            <Card key={acc.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="mt-1 h-9 w-9 shrink-0 rounded-full"
                    style={{ backgroundColor: acc.color }}
                  />
                  <div>
                    <p className="font-medium">{acc.name}</p>
                    <p className="text-xs text-muted">
                      {acc.yieldType === "none"
                        ? "Sem rendimento"
                        : `${
                            acc.yieldType === "cdi"
                              ? `${acc.yieldPercent}% do CDI`
                              : acc.yieldType === "selic"
                                ? `${acc.yieldPercent}% da Selic`
                                : acc.yieldType === "fixed_year"
                                  ? `${acc.yieldPercent}% a.a.`
                                  : `${acc.yieldPercent}% a.m.`
                          } · ${formatPercent(annual)} a.a.`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditing(acc)}
                    className="rounded-lg p-1.5 text-muted hover:text-white"
                    aria-label="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => dispatch({ type: "DELETE_ACCOUNT", id: acc.id })}
                    className="rounded-lg p-1.5 text-muted hover:text-rose-400"
                    aria-label="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-semibold">{formatBRL(current)}</p>
                  {rend > 0 && (
                    <p className="inline-flex items-center gap-1 text-xs text-brand">
                      <TrendingUp size={12} /> +{formatBRL(rend)} rendimento ·
                      base {formatBRL(nominal)}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {(creating || editing) && (
        <Modal
          title={editing ? "Editar conta" : "Nova conta"}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
        >
          <AccountForm
            initial={editing ?? undefined}
            onCancel={() => {
              setCreating(false);
              setEditing(null);
            }}
            onSubmit={(draft) => {
              if (editing) {
                dispatch({ type: "UPDATE_ACCOUNT", account: { ...draft, id: editing.id } });
              } else {
                dispatch({ type: "ADD_ACCOUNT", account: draft });
              }
              setCreating(false);
              setEditing(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
