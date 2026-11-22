import { useState } from "react";
import type { Account, YieldType } from "@/lib/types";
import { Button, Field, inputClass } from "./ui";
import { todayISO } from "@/lib/format";

const KINDS: { value: Account["kind"]; label: string }[] = [
  { value: "wallet", label: "Carteira" },
  { value: "bank", label: "Conta corrente" },
  { value: "savings", label: "Poupança" },
  { value: "investment", label: "Investimento" },
];

const YIELDS: { value: YieldType; label: string }[] = [
  { value: "none", label: "Sem rendimento" },
  { value: "cdi", label: "% do CDI" },
  { value: "selic", label: "% da Selic" },
  { value: "fixed_year", label: "% ao ano" },
  { value: "fixed_month", label: "% ao mês" },
];

const COLORS = ["#22c55e", "#38bdf8", "#a78bfa", "#f59e0b", "#f472b6", "#fb7185"];

type Draft = Omit<Account, "id">;

export function AccountForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Account;
  onSubmit: (draft: Draft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(
    initial ?? {
      name: "",
      kind: "bank",
      initialBalance: 0,
      color: COLORS[0],
      yieldType: "none",
      yieldPercent: 100,
      businessDays: true,
      yieldStartDate: todayISO(),
    },
  );

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const hasYield = draft.yieldType !== "none";

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!draft.name.trim()) return;
        onSubmit(draft);
      }}
    >
      <Field label="Nome">
        <input
          className={inputClass}
          value={draft.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ex: Conta Corrente"
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Tipo">
          <select
            className={inputClass}
            value={draft.kind}
            onChange={(e) => set("kind", e.target.value as Account["kind"])}
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Saldo inicial (R$)">
          <input
            className={inputClass}
            type="number"
            step="0.01"
            value={draft.initialBalance}
            onChange={(e) => set("initialBalance", Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Rendimento">
        <select
          className={inputClass}
          value={draft.yieldType}
          onChange={(e) => set("yieldType", e.target.value as YieldType)}
        >
          {YIELDS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>
      </Field>

      {hasYield && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label={
                draft.yieldType === "cdi" || draft.yieldType === "selic"
                  ? "Percentual do índice (%)"
                  : "Taxa (%)"
              }
            >
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={draft.yieldPercent}
                onChange={(e) => set("yieldPercent", Number(e.target.value))}
              />
            </Field>
            <Field label="Rende desde">
              <input
                className={inputClass}
                type="date"
                value={draft.yieldStartDate}
                onChange={(e) => set("yieldStartDate", e.target.value)}
              />
            </Field>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm">
                Rende só em <strong>dias úteis</strong> (252)
                <span className="block text-xs text-muted">
                  Ligado: CDB/LCI. Desligado: poupança (365 dias corridos).
                </span>
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-brand"
                checked={draft.businessDays}
                onChange={(e) => set("businessDays", e.target.checked)}
              />
            </label>
          </div>
        </>
      )}

      <Field label="Cor">
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("color", c)}
              className={`h-8 w-8 rounded-full border-2 ${
                draft.color === c ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Cor ${c}`}
            />
          ))}
        </div>
      </Field>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1">
          Salvar
        </Button>
      </div>
    </form>
  );
}
