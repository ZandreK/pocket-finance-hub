import { useState } from "react";
import type { Transaction } from "@/lib/types";
import { Button, Field, inputClass } from "./ui";
import { useStore } from "@/store/StoreContext";
import { todayISO } from "@/lib/format";

type Draft = Omit<Transaction, "id" | "createdAt">;

export function TransactionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (draft: Draft) => void;
  onCancel: () => void;
}) {
  const { state } = useStore();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(todayISO());
  const [source, setSource] = useState<string>(
    state.accounts[0] ? `acc:${state.accounts[0].id}` : "",
  );
  const [categoryId, setCategoryId] = useState<string>("");

  const categories = state.categories.filter((c) => c.type === type);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !source) return;
    const isCard = source.startsWith("card:");
    const id = source.split(":")[1];
    onSubmit({
      accountId: isCard ? null : id,
      cardId: isCard ? id : null,
      type: isCard ? "expense" : type,
      amount,
      categoryId: categoryId || null,
      description: description.trim() || (isCard ? "Gasto no cartão" : "Lançamento"),
      date,
      paid: isCard ? false : true,
    });
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-2">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`rounded-xl py-2.5 text-sm font-medium ${
              type === t
                ? t === "income"
                  ? "bg-brand text-black"
                  : "bg-rose-500 text-white"
                : "bg-surface-2 text-muted"
            }`}
          >
            {t === "income" ? "Entrada" : "Saída"}
          </button>
        ))}
      </div>

      <Field label="Valor (R$)">
        <input
          className={inputClass}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          autoFocus
        />
      </Field>

      <Field label="Origem">
        <select
          className={inputClass}
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <optgroup label="Contas">
            {state.accounts.map((a) => (
              <option key={a.id} value={`acc:${a.id}`}>
                {a.name}
              </option>
            ))}
          </optgroup>
          {type === "expense" && state.cards.length > 0 && (
            <optgroup label="Cartões (fatura)">
              {state.cards.map((c) => (
                <option key={c.id} value={`card:${c.id}`}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria">
          <select
            className={inputClass}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Data">
          <input
            className={inputClass}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
      </div>

      <Field label="Descrição">
        <input
          className={inputClass}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
        />
      </Field>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          Adicionar
        </Button>
      </div>
    </form>
  );
}
