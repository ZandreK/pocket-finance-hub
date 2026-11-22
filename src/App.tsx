import { Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { useRates } from "./hooks/useRates";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Cards from "./pages/Cards";
import Reports from "./pages/Reports";

export default function App() {
  // Carrega CDI/Selic do Banco Central (1x/dia, com cache).
  useRates();

  return (
    <div className="mx-auto min-h-full max-w-app px-4 pb-24 pt-5">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/contas" element={<Accounts />} />
        <Route path="/lancamentos" element={<Transactions />} />
        <Route path="/cartoes" element={<Cards />} />
        <Route path="/relatorios" element={<Reports />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
