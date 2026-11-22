/**
 * Cliente Supabase (modo cloud — opcional).
 *
 * A versão demo roda 100% no navegador com localStorage e NÃO precisa disto.
 * Para rodar em modo cloud, instale `@supabase/supabase-js`, preencha o .env
 * (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY — sempre a chave anon/pública) e
 * troque o StoreProvider por uma camada que lê/grava nas tabelas de
 * `supabase/migrations`. O schema já vem com RLS por usuário.
 *
 * Mantido como referência da arquitetura full-stack do projeto.
 */
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
};

export const isCloudEnabled = Boolean(
  supabaseConfig.url && supabaseConfig.anonKey,
);
