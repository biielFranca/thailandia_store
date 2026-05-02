import Link from "next/link";
import { StoreShell } from "@/components/storefront/store-shell";

export default function LoginPage() {
  return (
    <StoreShell>
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <section className="panel mx-auto grid w-full max-w-5xl gap-0 overflow-hidden rounded-[2rem] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-[linear-gradient(180deg,rgba(79,70,229,0.22),rgba(9,13,34,1))] p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c7c1ff]">
              Area do cliente
            </p>
            <h1 className="font-heading mt-3 text-5xl text-white sm:text-6xl">Login</h1>
            <p className="mt-4 max-w-md text-sm leading-8 text-white/66">
              Entre para acompanhar pedidos, salvar itens no carrinho e seguir para compra com
              menos atrito.
            </p>
          </div>

          <div className="p-8 sm:p-10">
            <div className="flex gap-3">
              <Link
                href="/login"
                className="rounded-full bg-[#4f46e5] px-4 py-2 text-sm font-semibold text-white"
              >
                Login
              </Link>
              <Link
                href="/cadastro"
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/72"
              >
                Cadastro
              </Link>
            </div>

            <form className="mt-8 space-y-4">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="h-12 w-full rounded-full border border-white/10 bg-[#090d22] px-5 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#4f46e5]"
              />
              <input
                type="password"
                placeholder="Sua senha"
                className="h-12 w-full rounded-full border border-white/10 bg-[#090d22] px-5 text-sm text-white outline-none transition placeholder:text-white/28 focus:border-[#4f46e5]"
              />
              <button
                type="submit"
                className="button-pop w-full rounded-full bg-[#4f46e5] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white"
              >
                Entrar
              </button>
            </form>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
