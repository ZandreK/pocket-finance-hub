import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  Account,
  AppState,
  Category,
  CreditCard,
  Rates,
  Transaction,
} from "@/lib/types";
import { load, save } from "@/lib/storage";
import { seedState } from "./seed";
import { uid } from "@/lib/format";

type Action =
  | { type: "SET_RATES"; rates: Rates }
  | { type: "ADD_ACCOUNT"; account: Omit<Account, "id"> }
  | { type: "UPDATE_ACCOUNT"; account: Account }
  | { type: "DELETE_ACCOUNT"; id: string }
  | { type: "ADD_CATEGORY"; category: Omit<Category, "id"> }
  | { type: "DELETE_CATEGORY"; id: string }
  | { type: "ADD_CARD"; card: Omit<CreditCard, "id"> }
  | { type: "UPDATE_CARD"; card: CreditCard }
  | { type: "DELETE_CARD"; id: string }
  | { type: "ADD_TX"; tx: Omit<Transaction, "id" | "createdAt"> }
  | { type: "DELETE_TX"; id: string }
  | { type: "PAY_INVOICE"; cardId: string; debitAccountId: string; date: string };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_RATES":
      return { ...state, rates: action.rates };

    case "ADD_ACCOUNT":
      return {
        ...state,
        accounts: [...state.accounts, { ...action.account, id: uid() }],
      };
    case "UPDATE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map((a) =>
          a.id === action.account.id ? action.account : a,
        ),
      };
    case "DELETE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.filter((a) => a.id !== action.id),
        transactions: state.transactions.filter((t) => t.accountId !== action.id),
      };

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, { ...action.category, id: uid() }],
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
      };

    case "ADD_CARD":
      return { ...state, cards: [...state.cards, { ...action.card, id: uid() }] };
    case "UPDATE_CARD":
      return {
        ...state,
        cards: state.cards.map((c) => (c.id === action.card.id ? action.card : c)),
      };
    case "DELETE_CARD":
      return {
        ...state,
        cards: state.cards.filter((c) => c.id !== action.id),
        transactions: state.transactions.filter((t) => t.cardId !== action.id),
      };

    case "ADD_TX":
      return {
        ...state,
        transactions: [
          { ...action.tx, id: uid(), createdAt: new Date().toISOString() },
          ...state.transactions,
        ],
      };
    case "DELETE_TX":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.id),
      };

    case "PAY_INVOICE": {
      const total = state.transactions
        .filter((t) => t.cardId === action.cardId && !t.paid)
        .reduce((s, t) => s + t.amount, 0);
      if (total <= 0) return state;

      const paid = state.transactions.map((t) =>
        t.cardId === action.cardId && !t.paid ? { ...t, paid: true } : t,
      );
      const payment: Transaction = {
        id: uid(),
        accountId: action.debitAccountId,
        cardId: null,
        type: "expense",
        amount: total,
        categoryId: null,
        description: "Pagamento de fatura",
        date: action.date,
        paid: true,
        createdAt: new Date().toISOString(),
      };
      return { ...state, transactions: [payment, ...paid] };
    }

    default:
      return state;
  }
}

interface StoreValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreCtx = createContext<StoreValue | null>(null);

const STORAGE_KEY = "state";

function init(): AppState {
  const persisted = load<AppState | null>(STORAGE_KEY, null);
  if (persisted && Array.isArray(persisted.accounts)) {
    return { ...persisted, rates: persisted.rates ?? null };
  }
  return seedState();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  useEffect(() => {
    save(STORAGE_KEY, state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}
