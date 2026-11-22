import { useState } from "react";
import { CreditCard as CardIcon, Receipt } from "lucide-react";
import { useStore } from "@/store/StoreContext";
import { cardInvoice, cardAvailable } from "@/lib/selectors";
import { formatBRL, formatDate, todayISO } from "@/lib/format";
import { Card, Button, Modal, Field, inputClass } from "@/components/ui";

export default function Cards() {
  const { state, dispatch } = useStore();
  const [paying, setPaying] = useState<string | null>(null);

  const payingCard = state.cards.find((c) => c.id === paying);
  const [debitAccountId, setDebitAccountId] = useState("");

  const openPay = (cardId: string) => {
    const card = state.cards.find((c) => c.id === cardId);
    setDebitAccountId(card?.debitAccountId ?? state.accounts[0]?.id ?? "");
    setPaying(cardId);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Cartões</h1>

      <div className="space-y-3">
        {state.cards.length === 0 && (
          <p className="text-sm text-muted">Nenhum cartão cadastrado.</p>
        )}
        {state.cards.map((card) => {
          const invoice = cardInvoice(state, card.id);
          const available = cardAvailable(state, card.id);
          const used = card.limit > 0 ? (invoice / card.limit) * 100 : 0;
          const txs = state.transactions
            .filter((t) => t.cardId === card.id && !t.paid)
            .sort((a, b) => (a.date < b.date ? 1 : -1));
          return (
            <Card key={card.id}>
              <div
                className="rounded-xl p-4 text-white"
                style={{
                  background: `linear-gradient(135deg, ${card.color}, #0b1512)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <CardIcon size={18} /> {card.name}
                  </span>
                  <span className="text-xs opacity-80">
                    fecha dia {card.closingDay} · vence {card.dueDay}
                  </span>
                </div>
                <p className="mt-4 text-xs opacity-80">Fatura aberta</p>
                <p className="text-2xl font-bold">{formatBRL(invoice)}</p>
              </div>

              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.min(100, used)}%` }}
                  />
                </div>
                <p className="mt-1 flex justify-between text-xs text-muted">
                  <span>Disponível {formatBRL(available)}</span>
                  <span>Limite {formatBRL(card.limit)}</span>
                </p>
              </div>

              {txs.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {txs.map((t) => (
                    <li
                      key={t.id}
                      className="flex justify-between text-sm text-muted"
                    >
                      <span className="truncate">
                        {formatDate(t.date)} · {t.description}
                      </span>
                      <span>{formatBRL(t.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Button
                variant="ghost"
                className="mt-3 flex w-full items-center justify-center gap-2"
                disabled={invoice <= 0}
                onClick={() => openPay(card.id)}
              >
                <Receipt size={16} /> Pagar fatura
              </Button>
            </Card>
          );
        })}
      </div>

      {payingCard && (
        <Modal title="Pagar fatura" onClose={() => setPaying(null)}>
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Fatura de{" "}
              <strong className="text-white">
                {formatBRL(cardInvoice(state, payingCard.id))}
              </strong>{" "}
              do {payingCard.name}. Isso cria uma despesa na conta escolhida e
              libera o limite.
            </p>
            <Field label="Debitar da conta">
              <select
                className={inputClass}
                value={debitAccountId}
                onChange={(e) => setDebitAccountId(e.target.value)}
              >
                {state.accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setPaying(null)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                disabled={!debitAccountId}
                onClick={() => {
                  dispatch({
                    type: "PAY_INVOICE",
                    cardId: payingCard.id,
                    debitAccountId,
                    date: todayISO(),
                  });
                  setPaying(null);
                }}
              >
                Confirmar pagamento
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
