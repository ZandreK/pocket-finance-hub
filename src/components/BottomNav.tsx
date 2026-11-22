import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  PieChart,
} from "lucide-react";

const items = [
  { to: "/", label: "Início", icon: LayoutDashboard, end: true },
  { to: "/contas", label: "Contas", icon: Wallet },
  { to: "/lancamentos", label: "Lançar", icon: ArrowLeftRight },
  { to: "/cartoes", label: "Cartões", icon: CreditCard },
  { to: "/relatorios", label: "Relatórios", icon: PieChart },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-app items-stretch justify-between px-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] ${
                isActive ? "text-brand" : "text-muted"
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
