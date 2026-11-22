# Pocket Finance Hub

Aplicativo de **controle financeiro pessoal** (mobile-first) com um diferencial:
cada conta pode render com base no **CDI ou na Selic**, usando as taxas oficiais
e atualizadas do **Banco Central do Brasil**.

> Projeto pessoal. Esta é uma versão reconstruída e de código aberto do app,
> focada em demonstrar a arquitetura e a regra de negócio. Roda 100% no
> navegador (sem backend obrigatório).

## Destaques

- **Rendimento por conta com CDI/Selic ao vivo** — integração com a API pública
  do Banco Central (SGS). Cada conta pode render `% do CDI` (ex.: 120%),
  `% da Selic`, `% ao ano` ou `% ao mês`, e o saldo passa a mostrar o
  **rendimento acumulado** desde a data de início.
- **Dias úteis (252) vs. corridos (365)** — a mesma lógica que diferencia
  CDB/LCI de poupança, configurável por conta.
- **Cartões de crédito** — fatura aberta, uso do limite e o fluxo **"pagar
  fatura"**: debita de uma conta, cria a despesa e libera o limite.
- **Contas, lançamentos, categorias e relatórios** — dashboard com patrimônio
  total, entradas/saídas do mês e gastos por categoria.
- **Persistência local** — tudo é salvo no `localStorage`; recarregou, continua lá.

## A integração com o Banco Central

Os dados vêm da série temporal do SGS (gratuita, sem chave):

| Índice | Série | Endpoint |
|--------|-------|----------|
| CDI anualizado (base 252) | `4389` | `api.bcb.gov.br/dados/serie/bcdata.sgs.4389/dados/ultimos/1?formato=json` |
| Meta Selic (Copom, % a.a.) | `432` | `api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json` |

As taxas são buscadas 1x/dia e guardadas em cache. Se a API estiver
indisponível, o app usa um valor de referência e sinaliza o estado "offline".

O cálculo do rendimento (`src/lib/yield.ts`) converte a taxa anual em taxa
diária pela base escolhida (252 ou 365) e compõe sobre os dias decorridos:

```
taxaDiaria = (1 + anual/100)^(1/base) − 1
rendimento = saldo × ((1 + taxaDiaria)^diasDecorridos − 1)
```

## Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** (tema dark, verde de marca)
- **React Router** e **Recharts**
- **Banco Central (SGS)** para CDI/Selic
- **Supabase/PostgreSQL** como backend opcional (schema com RLS em
  `supabase/migrations/`)

## Rodando localmente

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar. Não precisa de backend nem de chaves — a
versão demo já vem com dados de exemplo.

### Modo cloud (opcional)

O app foi desenhado para também rodar com Supabase (auth por usuário + dados
sincronizados entre dispositivos). O schema com **Row Level Security** está em
`supabase/migrations/0001_schema.sql`. Para ligar, copie `.env.example` para
`.env` e preencha com a URL e a **chave anon/pública** do seu projeto — nunca a
`service_role` no frontend.

## Estrutura

```
src/
  lib/        domínio, formatação, Banco Central (bcb.ts), rendimento (yield.ts)
  store/      estado global (Context + reducer) e dados de exemplo
  hooks/      useRates (CDI/Selic com cache)
  components/ UI, formulários de conta e lançamento, navegação
  pages/      dashboard, contas, lançamentos, cartões, relatórios
supabase/
  migrations/ schema PostgreSQL com RLS (versão cloud)
```

## Licença

[MIT](LICENSE) — André Martins da Silva.
