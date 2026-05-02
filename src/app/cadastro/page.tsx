import Link from "next/link";
import { StoreShell } from "@/components/storefront/store-shell";

export default function CadastroPage() {
  return (
    <StoreShell>
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <section className="panel mx-auto grid w-full max-w-5xl gap-0 overflow-hidden rounded-[2rem] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[linear-gradient(180deg,rgba(168,85,247,0.22),rgba(9,13,34,1))] p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#dfc9ff]">
              Crie sua conta
            </p>
            <h1 className="font-heading mt-3 text-5xl text-white sm:text-6xl">Cadastro</h1>
            <p className="mt-4 max-w-md text-sm leading-8 text-white/66">
              Cadastre-se para salvar enderecos, acelerar o checkout e acompanhar seus pedidos
              em um so lugar.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/72"
              >
                Login
              </Link>
              <Link
                href="/cadastro"
                className="rounded-full bg-[#a855f7] px-4 py-2 text-sm font-semibold text-white"
              >
                Cadastro
              </Link>
            </div>

            <form className="mt-8 space-y-4">
              <input
                type="text"
                placeholder="Seu nome"
                className="h-12 w-full rounded-full border border-white/10 bg-[#090d22] px-5 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#a855f7]"
              />
              <input
                type="email"
                placeholder="Seu e-mail"
                className="h-12 w-full rounded-full border border-white/10 bg-[#090d22] px-5 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#a855f7]"
              />
              <input
                type="password"
                placeholder="Crie uma senha"
                className="h-12 w-full rounded-full border border-white/10 bg-[#090d22] px-5 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#a855f7]"
              />
              <button
                type="submit"
                className="button-pop w-full rounded-full bg-[#a855f7] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white"
              >
                Criar conta
              </button>
            </form>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
