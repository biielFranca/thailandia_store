"use client";

import { useMemo, useState } from "react";

type ShippingResult = {
  service: string;
  price: string;
  estimate: string;
};

function getShippingFromCep(cep: string): ShippingResult {
  const normalized = cep.replace(/\D/g, "");
  const leadingDigit = Number(normalized[0] ?? 0);

  if (leadingDigit <= 2) {
    return {
      service: "Express",
      price: "R$ 24,90",
      estimate: "2 a 4 dias uteis",
    };
  }

  if (leadingDigit <= 5) {
    return {
      service: "Padrao",
      price: "R$ 19,90",
      estimate: "4 a 7 dias uteis",
    };
  }

  return {
    service: "Economico",
    price: "R$ 14,90",
    estimate: "6 a 10 dias uteis",
  };
}

export function ShippingCalculator() {
  const [cep, setCep] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);

  const canCalculate = cep.replace(/\D/g, "").length === 8;

  const result = useMemo(() => {
    if (!canCalculate) {
      return null;
    }

    return getShippingFromCep(cep);
  }, [canCalculate, cep]);

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/46">Calcule o frete</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          value={cep}
          onChange={(event) => setCep(event.target.value)}
          placeholder="Digite seu CEP"
          className="h-12 flex-1 rounded-full border border-white/10 bg-[#090d22] px-5 text-sm text-[#fff] outline-none transition placeholder:text-white/28 focus:border-[#4f46e5]"
        />
        <button
          type="button"
          disabled={!canCalculate}
          onClick={() => setHasCalculated(true)}
          className="button-pop rounded-full bg-[#4f46e5] px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#fff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Calcular
        </button>
      </div>

      {hasCalculated && result ? (
        <div className="mt-4 rounded-[1.25rem] border border-[#4f46e5]/25 bg-[#4f46e5]/8 p-4 text-sm text-white/82">
          <p className="font-semibold uppercase tracking-[0.12em] text-[#fff]">
            {result.service}
          </p>
          <p className="mt-2">
            Entrega estimada: <span className="font-semibold">{result.estimate}</span>
          </p>
          <p className="mt-1">
            Valor do frete: <span className="font-semibold">{result.price}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
