export function StoreFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#060818] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[1fr_auto_auto] lg:items-center">
        <div>
          <p className="font-heading text-3xl text-white">THAILANDIA STORE</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-white/56">
            Streetwear comercial com identidade noturna, foco em produto e navegacao
            desenhada para venda online.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm font-semibold uppercase tracking-[0.08em] text-white/64">
          <a href="#">Politica de privacidade</a>
          <a href="#">Trocas e devolucoes</a>
          <a href="#">Ajuda</a>
        </div>

        <div className="flex items-center gap-3">
          {["IG", "TT", "YT"].map((item) => (
            <a
              key={item}
              href="#"
              className="button-pop inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold uppercase tracking-[0.14em] text-white/78"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
