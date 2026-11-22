import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useStore } from "@/store/StoreContext";
import { monthTotals } from "@/lib/selectors";
import { formatBRL, todayISO } from "@/lib/format";
import { Card } from "@/components/ui";

export default function Reports() {
  const { state } = useStore();
  const [month, setMonth] = useState(todayISO().slice(0, 7));

  const { income, expense, net } = monthTotals(state, month);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of state.transactions) {
      if (tx.type !== "expense" || tx.cardId) continue;
      if (!tx.date.startsWith(month)) continue;
      const cat = state.categories.find((c) => c.id === tx.categoryId);
      const key = cat?.name ?? "Outros";
      map.set(key, (map.get(key) ?? 0) + tx.amount);
    }
    const colors = state.categories.reduce<Record<string, string>>((acc, c) => {
      acc[c.name] = c.color;
      return acc;
    }, {});
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value, color: colors[name] ?? "#64748b" }))
      .sort((a, b) => b.value - a.value);
  }, [state, month]);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Relatórios</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-sm text-white outline-none focus:border-brand"
        />
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Card className="text-center">
          <p className="text-xs text-muted">Entradas</p>
          <p className="mt-1 text-sm font-semibold text-brand">{formatBRL(income)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-muted">Saídas</p>
          <p className="mt-1 text-sm font-semibold text-rose-400">
            {formatBRL(expense)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-muted">Saldo</p>
          <p
            className={`mt-1 text-sm font-semibold ${
              net >= 0 ? "text-brand" : "text-rose-400"
            }`}
          >
            {formatBRL(net)}
          </p>
        </Card>
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-semibold text-muted">
          Gastos por categoria
        </h2>
        {byCategory.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            Sem despesas neste mês.
          </p>
        ) : (
          <>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {byCategory.map((d) => (
                      <Cell key={d.name} fill={d.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatBRL(v)}
                    contentStyle={{
                      background: "#111f1a",
                      border: "1px solid #223a30",
                      borderRadius: 12,
                      color: "#e8f2ec",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1.5">
              {byCategory.map((d) => (
                <li key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    {d.name}
                  </span>
                  <span className="text-muted">{formatBRL(d.value)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
