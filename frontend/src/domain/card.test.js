import { describe, expect, it } from "vitest";

import {
  detectCardBrand,
  formatCardNumber,
  getExpectedCvvLength,
  isExpiryInPast,
  isLuhnValid,
  normalizeCardNumber,
  parseExpiry,
  validateCardForm,
} from "./card.js";

// Luhn'a uygun, herkesçe bilinen test numaraları.
const VISA = "4111111111111111";
const MASTERCARD = "5555555555554444";
const AMEX = "378282246310005";

const REFERENCE = new Date(2026, 7, 24); // 24 Ağustos 2026

describe("normalizeCardNumber", () => {
  it("boşluk ve tireleri atar", () => {
    expect(normalizeCardNumber("4111 1111-1111 1111")).toBe(VISA);
  });

  it("boş girdide boş metin döner", () => {
    expect(normalizeCardNumber(null)).toBe("");
  });
});

describe("detectCardBrand", () => {
  it("Visa, Mastercard ve Amex'i ayırt eder", () => {
    expect(detectCardBrand(VISA)).toBe("visa");
    expect(detectCardBrand(MASTERCARD)).toBe("mastercard");
    expect(detectCardBrand(AMEX)).toBe("amex");
  });

  it("tanınmayan öneki null döner", () => {
    expect(detectCardBrand("1234567890123456")).toBeNull();
  });
});

describe("formatCardNumber", () => {
  it("dörtlü gruplar", () => {
    expect(formatCardNumber(VISA)).toBe("4111 1111 1111 1111");
  });

  it("Amex'i 4-6-5 düzeninde gruplar", () => {
    // Amex 15 haneli; dörtlü gruplama yanlış görünürdü.
    expect(formatCardNumber(AMEX)).toBe("3782 822463 10005");
  });
});

describe("isLuhnValid", () => {
  it("geçerli numaraları kabul eder", () => {
    expect(isLuhnValid(VISA)).toBe(true);
    expect(isLuhnValid(MASTERCARD)).toBe(true);
    expect(isLuhnValid(AMEX)).toBe(true);
  });

  it("tek rakamı değişmiş numarayı reddeder", () => {
    expect(isLuhnValid("4111111111111112")).toBe(false);
  });

  it("çok kısa numarayı reddeder", () => {
    expect(isLuhnValid("411111")).toBe(false);
  });
});

describe("getExpectedCvvLength", () => {
  it("Amex'te 4, diğerlerinde 3 hane bekler", () => {
    expect(getExpectedCvvLength(AMEX)).toBe(4);
    expect(getExpectedCvvLength(VISA)).toBe(3);
  });

  it("marka bilinmiyorsa 3'e düşer", () => {
    expect(getExpectedCvvLength("")).toBe(3);
  });
});

describe("parseExpiry / isExpiryInPast", () => {
  it("AA/YY biçimini ayrıştırır", () => {
    expect(parseExpiry("12/28")).toEqual({ month: 12, year: 2028 });
  });

  it("geçersiz ayı reddeder", () => {
    expect(parseExpiry("13/28")).toBeNull();
    expect(parseExpiry("1/28")).toBeNull();
  });

  it("gelecekteki tarihi geçmiş saymaz", () => {
    expect(isExpiryInPast("12/28", REFERENCE)).toBe(false);
  });

  it("kartı ait olduğu ayın SONUNA kadar geçerli sayar", () => {
    // Referans Ağustos 2026; 08/26 kartı ay sonuna kadar geçerlidir.
    expect(isExpiryInPast("08/26", REFERENCE)).toBe(false);
    expect(isExpiryInPast("07/26", REFERENCE)).toBe(true);
  });
});

describe("validateCardForm", () => {
  const VALID = {
    cardHolder: "Ömer Faruk",
    cardNumber: VISA,
    expiry: "12/28",
    cvv: "123",
  };

  it("geçerli formda hata üretmez", () => {
    expect(validateCardForm(VALID, REFERENCE)).toEqual({});
  });

  it("kısa isim reddedilir", () => {
    const errors = validateCardForm({ ...VALID, cardHolder: "Ö" }, REFERENCE);
    expect(errors.cardHolder).toMatch(/en az 3/);
  });

  it("rakam içeren isim reddedilir", () => {
    const errors = validateCardForm(
      { ...VALID, cardHolder: "Omer 123" },
      REFERENCE
    );
    expect(errors.cardHolder).toMatch(/yalnızca harf/);
  });

  it("Türkçe karakterli isim kabul edilir", () => {
    const errors = validateCardForm(
      { ...VALID, cardHolder: "Şükrü Çağrı Öz" },
      REFERENCE
    );
    expect(errors.cardHolder).toBeUndefined();
  });

  it("yanlış uzunlukta kart markaya göre reddedilir", () => {
    const errors = validateCardForm(
      { ...VALID, cardNumber: "411111111111" },
      REFERENCE
    );
    expect(errors.cardNumber).toMatch(/Visa/);
  });

  it("Luhn'dan geçmeyen numara reddedilir", () => {
    const errors = validateCardForm(
      { ...VALID, cardNumber: "4111111111111112" },
      REFERENCE
    );
    expect(errors.cardNumber).toMatch(/geçersiz/i);
  });

  it("geçmiş son kullanma tarihi reddedilir", () => {
    const errors = validateCardForm({ ...VALID, expiry: "01/25" }, REFERENCE);
    expect(errors.expiry).toMatch(/geçmiş/);
  });

  it("Amex'te 3 haneli CVV reddedilir", () => {
    const errors = validateCardForm(
      { ...VALID, cardNumber: AMEX, cvv: "123" },
      REFERENCE
    );
    expect(errors.cvv).toMatch(/4 hane/);
  });

  it("Amex'te 4 haneli CVV kabul edilir", () => {
    const errors = validateCardForm(
      { ...VALID, cardNumber: AMEX, cvv: "1234" },
      REFERENCE
    );
    expect(errors.cvv).toBeUndefined();
  });

  it("harf içeren CVV reddedilir", () => {
    const errors = validateCardForm({ ...VALID, cvv: "12a" }, REFERENCE);
    expect(errors.cvv).toMatch(/rakam/);
  });

  it("boşluklu girilen kart numarası kabul edilir", () => {
    // Kullanıcı gruplu yazdığında da doğrulama ham rakamlar üzerinden yapılır.
    const errors = validateCardForm(
      { ...VALID, cardNumber: "4111 1111 1111 1111" },
      REFERENCE
    );
    expect(errors.cardNumber).toBeUndefined();
  });
});
