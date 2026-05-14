import { describe, it, expect } from "vitest";
import { maskCep, maskPhone, maskCpf, formatBRL, shortRef } from "../formatting";

describe("maskCep", () => {
  it("formats 8 digits as 00000-000", () => {
    expect(maskCep("01310100")).toBe("01310-100");
  });

  it("does not add hyphen below 6 digits", () => {
    expect(maskCep("12345")).toBe("12345");
    expect(maskCep("1234")).toBe("1234");
  });

  it("strips non-digits", () => {
    expect(maskCep("01a3b1c0d1e0f0")).toBe("01310-100");
  });

  it("truncates at 8 digits", () => {
    expect(maskCep("0131010099")).toBe("01310-100");
  });

  it("handles empty input", () => {
    expect(maskCep("")).toBe("");
  });
});

describe("maskPhone", () => {
  it("formats 11-digit mobile as (00) 00000-0000", () => {
    expect(maskPhone("11999999999")).toBe("(11) 99999-9999");
  });

  it("formats 10-digit landline as (00) 0000-0000", () => {
    expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
  });

  it("formats partial 4-digit input", () => {
    expect(maskPhone("1199")).toBe("(11) 99");
  });

  it("strips non-digits", () => {
    expect(maskPhone("(11) 99999-9999")).toBe("(11) 99999-9999");
  });

  it("truncates at 11 digits", () => {
    expect(maskPhone("1199999999912345")).toBe("(11) 99999-9999");
  });

  it("returns just 2 digits if < 3 typed", () => {
    expect(maskPhone("11")).toBe("11");
    expect(maskPhone("1")).toBe("1");
    expect(maskPhone("")).toBe("");
  });
});

describe("maskCpf", () => {
  it("formats 11 digits as 000.000.000-00", () => {
    expect(maskCpf("12345678901")).toBe("123.456.789-01");
  });

  it("formats partial inputs progressively", () => {
    expect(maskCpf("123"))         .toBe("123");
    expect(maskCpf("1234"))        .toBe("123.4");
    expect(maskCpf("1234567"))     .toBe("123.456.7");
    expect(maskCpf("12345678901")) .toBe("123.456.789-01");
  });

  it("strips non-digits", () => {
    expect(maskCpf("123.456.789-01")).toBe("123.456.789-01");
  });

  it("truncates at 11 digits", () => {
    expect(maskCpf("12345678901999")).toBe("123.456.789-01");
  });
});

describe("formatBRL", () => {
  it("formats integers with R$ prefix", () => {
    //   is the non-breaking space used by Intl
    expect(formatBRL(100)).toBe("R$ 100,00");
  });

  it("formats decimals", () => {
    expect(formatBRL(129.9)).toBe("R$ 129,90");
    expect(formatBRL(0.5)).toBe("R$ 0,50");
  });

  it("handles zero", () => {
    expect(formatBRL(0)).toBe("R$ 0,00");
  });

  it("handles large numbers with thousands separator", () => {
    expect(formatBRL(1234567.89)).toBe("R$ 1.234.567,89");
  });
});

describe("shortRef", () => {
  it("returns first 8 chars uppercased", () => {
    expect(shortRef("a1b2c3d4-e5f6-7890-abcd-ef1234567890")).toBe("A1B2C3D4");
  });

  it("returns whole string if shorter than 8 chars", () => {
    expect(shortRef("abc")).toBe("ABC");
  });

  it("handles empty string", () => {
    expect(shortRef("")).toBe("");
  });
});
