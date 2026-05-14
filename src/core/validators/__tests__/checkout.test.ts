import { describe, it, expect } from "vitest";
import {
  validatePlaceOrderInput,
  applyPaymentTotal,
  round2,
  type PlaceOrderInput,
} from "../checkout";

// ── Helper: minimal valid payload ──────────────────────────────────────────

function validInput(overrides: Partial<PlaceOrderInput> = {}): PlaceOrderInput {
  return {
    items: [{ slug: "real-madrid-home-26-27", size: "M", quantity: 1 }],
    customer: { name: "João Silva", email: "joao@example.com" },
    address: {
      cep: "01310-100",
      street: "Av. Paulista",
      number: "1000",
      city: "São Paulo",
      state: "SP",
    },
    paymentMethod: "pix",
    ...overrides,
  };
}

// ─── round2 ────────────────────────────────────────────────────────────────

describe("round2", () => {
  it("rounds to 2 decimal places", () => {
    expect(round2(10.005)).toBe(10.01);
    expect(round2(10.004)).toBe(10);
    expect(round2(129.9)).toBe(129.9);
  });

  it("handles negative numbers", () => {
    expect(round2(-12.345)).toBe(-12.34);
  });

  it("returns 0 for 0", () => {
    expect(round2(0)).toBe(0);
  });
});

// ─── applyPaymentTotal ─────────────────────────────────────────────────────

describe("applyPaymentTotal", () => {
  it("PIX = subtotal (no surcharge)", () => {
    expect(applyPaymentTotal(100, "pix")).toBe(100);
    expect(applyPaymentTotal(129.9, "pix")).toBe(129.9);
  });

  it("card adds 8% surcharge", () => {
    expect(applyPaymentTotal(100, "card")).toBe(108);
    expect(applyPaymentTotal(129.9, "card")).toBe(140.29);
  });

  it("rounds card total to 2 decimals", () => {
    // 50 * 1.08 = 54.00 (already exact)
    expect(applyPaymentTotal(50, "card")).toBe(54);
    // 33.33 * 1.08 = 35.9964 → 36.00
    expect(applyPaymentTotal(33.33, "card")).toBe(36);
  });
});

// ─── validatePlaceOrderInput ───────────────────────────────────────────────

describe("validatePlaceOrderInput", () => {
  it("returns null for a valid payload", () => {
    expect(validatePlaceOrderInput(validInput())).toBeNull();
  });

  // ── Items ─────────────────────────────────────────────────────────────────

  describe("items", () => {
    it("rejects empty cart", () => {
      expect(validatePlaceOrderInput(validInput({ items: [] }))).toMatch(/vazio/i);
    });

    it("rejects more than 50 items", () => {
      const items = Array.from({ length: 51 }, (_, i) => ({
        slug: `produto-${i}`, size: "M", quantity: 1,
      }));
      expect(validatePlaceOrderInput(validInput({ items }))).toMatch(/demais/i);
    });

    it("rejects item without slug", () => {
      const items = [{ slug: "", size: "M", quantity: 1 }];
      expect(validatePlaceOrderInput(validInput({ items }))).toMatch(/slug/i);
    });

    it("rejects item without size", () => {
      const items = [{ slug: "produto", size: "", quantity: 1 }];
      expect(validatePlaceOrderInput(validInput({ items }))).toMatch(/tamanho/i);
    });

    it("rejects quantity = 0", () => {
      const items = [{ slug: "produto", size: "M", quantity: 0 }];
      expect(validatePlaceOrderInput(validInput({ items }))).toMatch(/quantidade/i);
    });

    it("rejects quantity > 20", () => {
      const items = [{ slug: "produto", size: "M", quantity: 21 }];
      expect(validatePlaceOrderInput(validInput({ items }))).toMatch(/quantidade/i);
    });

    it("rejects non-integer quantity", () => {
      const items = [{ slug: "produto", size: "M", quantity: 1.5 }];
      expect(validatePlaceOrderInput(validInput({ items }))).toMatch(/quantidade/i);
    });

    it("accepts quantity exactly 1 and exactly 20", () => {
      const lo = [{ slug: "p", size: "M", quantity: 1  }];
      const hi = [{ slug: "p", size: "M", quantity: 20 }];
      expect(validatePlaceOrderInput(validInput({ items: lo }))).toBeNull();
      expect(validatePlaceOrderInput(validInput({ items: hi }))).toBeNull();
    });
  });

  // ── Customer ──────────────────────────────────────────────────────────────

  describe("customer", () => {
    it("rejects empty name", () => {
      const i = validInput({ customer: { name: "", email: "a@b.com" } });
      expect(validatePlaceOrderInput(i)).toMatch(/nome/i);
    });

    it("rejects single-char name", () => {
      const i = validInput({ customer: { name: "J", email: "a@b.com" } });
      expect(validatePlaceOrderInput(i)).toMatch(/nome/i);
    });

    it("rejects name with only whitespace", () => {
      const i = validInput({ customer: { name: "   ", email: "a@b.com" } });
      expect(validatePlaceOrderInput(i)).toMatch(/nome/i);
    });

    it("rejects invalid email — no @", () => {
      const i = validInput({ customer: { name: "João", email: "joaoexample.com" } });
      expect(validatePlaceOrderInput(i)).toMatch(/e-?mail/i);
    });

    it("rejects invalid email — no domain", () => {
      const i = validInput({ customer: { name: "João", email: "joao@" } });
      expect(validatePlaceOrderInput(i)).toMatch(/e-?mail/i);
    });

    it("rejects invalid email — no TLD", () => {
      const i = validInput({ customer: { name: "João", email: "joao@example" } });
      expect(validatePlaceOrderInput(i)).toMatch(/e-?mail/i);
    });

    it("rejects email with spaces", () => {
      const i = validInput({ customer: { name: "João", email: "joao @ example.com" } });
      expect(validatePlaceOrderInput(i)).toMatch(/e-?mail/i);
    });

    it("accepts email with subdomain", () => {
      const i = validInput({ customer: { name: "João", email: "joao@mail.example.com" } });
      expect(validatePlaceOrderInput(i)).toBeNull();
    });
  });

  // ── Address ───────────────────────────────────────────────────────────────

  describe("address", () => {
    it("rejects CEP without proper format", () => {
      const i = validInput({ address: { ...validInput().address, cep: "123" } });
      expect(validatePlaceOrderInput(i)).toMatch(/cep/i);
    });

    it("accepts CEP with hyphen", () => {
      const i = validInput({ address: { ...validInput().address, cep: "01310-100" } });
      expect(validatePlaceOrderInput(i)).toBeNull();
    });

    it("accepts CEP without hyphen", () => {
      const i = validInput({ address: { ...validInput().address, cep: "01310100" } });
      expect(validatePlaceOrderInput(i)).toBeNull();
    });

    it("rejects CEP with letters", () => {
      const i = validInput({ address: { ...validInput().address, cep: "01310-ABC" } });
      expect(validatePlaceOrderInput(i)).toMatch(/cep/i);
    });

    it("rejects empty street", () => {
      const i = validInput({ address: { ...validInput().address, street: "" } });
      expect(validatePlaceOrderInput(i)).toMatch(/endere(ç|c)o/i);
    });

    it("rejects empty number", () => {
      const i = validInput({ address: { ...validInput().address, number: "" } });
      expect(validatePlaceOrderInput(i)).toMatch(/n(ú|u)mero/i);
    });

    it("rejects empty city", () => {
      const i = validInput({ address: { ...validInput().address, city: "" } });
      expect(validatePlaceOrderInput(i)).toMatch(/cidade/i);
    });

    it("rejects invalid state (not a real BR UF)", () => {
      const i = validInput({ address: { ...validInput().address, state: "XX" } });
      expect(validatePlaceOrderInput(i)).toMatch(/estado/i);
    });

    it("accepts state in lowercase", () => {
      const i = validInput({ address: { ...validInput().address, state: "sp" } });
      expect(validatePlaceOrderInput(i)).toBeNull();
    });

    it("accepts all 27 BR UFs", () => {
      const ufs = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
                   "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
      for (const uf of ufs) {
        const i = validInput({ address: { ...validInput().address, state: uf } });
        expect(validatePlaceOrderInput(i), `state ${uf} should be valid`).toBeNull();
      }
    });
  });

  // ── Payment ───────────────────────────────────────────────────────────────

  describe("payment", () => {
    it("accepts pix", () => {
      expect(validatePlaceOrderInput(validInput({ paymentMethod: "pix" }))).toBeNull();
    });

    it("accepts card", () => {
      expect(validatePlaceOrderInput(validInput({ paymentMethod: "card" }))).toBeNull();
    });

    it("rejects invalid payment method", () => {
      const i = { ...validInput(), paymentMethod: "boleto" as never };
      expect(validatePlaceOrderInput(i)).toMatch(/m(é|e)todo/i);
    });
  });

  // ── Security: payload tampering ───────────────────────────────────────────

  describe("security: payload tampering", () => {
    it("rejects when client tries to send no items at all", () => {
      // Even a well-formed empty array should not slip through.
      expect(validatePlaceOrderInput(validInput({ items: [] }))).toMatch(/vazio/i);
    });

    it("does NOT trust client-side payment method outside of pix/card", () => {
      // A client could try to inject an arbitrary string like "pix-no-fee"
      // to skip the card surcharge. Validator blocks it.
      const tampered = { ...validInput(), paymentMethod: "pix-no-fee" as never };
      expect(validatePlaceOrderInput(tampered)).toMatch(/m(é|e)todo/i);
    });
  });
});
