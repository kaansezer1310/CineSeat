/**
 * Kart doğrulama kuralları.
 *
 * Bu dosya SAF mantıktır: ağ çağrısı yok, React yok, yan etki yok. Kart
 * verisi buradan hiçbir yere yazılmaz — doğrulama yapılır, sonuç döner.
 */

export const CARD_BRANDS = {
  visa: {
    label: "Visa",
    // 4 ile başlar; 13, 16 veya 19 hane.
    pattern: /^4/,
    lengths: [13, 16, 19],
    cvvLength: 3,
  },
  mastercard: {
    label: "Mastercard",
    // 51–55 ya da 2221–2720 aralığı.
    pattern: /^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/,
    lengths: [16],
    cvvLength: 3,
  },
  amex: {
    label: "American Express",
    pattern: /^3[47]/,
    lengths: [15],
    // Amex'te güvenlik kodu 4 hanedir — tek istisna bu.
    cvvLength: 4,
  },
  troy: {
    label: "Troy",
    pattern: /^(9792|65)/,
    lengths: [16],
    cvvLength: 3,
  },
};

/** Girilen metinden yalnızca rakamları alır (boşluk, tire vs. atılır). */
export function normalizeCardNumber(value) {
  return String(value ?? "").replace(/\D/g, "");
}

/** "4111 1111 1111 1111" biçiminde gruplar; Amex 4-6-5 düzenindedir. */
export function formatCardNumber(value) {
  const digits = normalizeCardNumber(value);
  const brand = detectCardBrand(digits);

  const groups =
    brand === "amex"
      ? [digits.slice(0, 4), digits.slice(4, 10), digits.slice(10, 15)]
      : digits.match(/.{1,4}/g) ?? [];

  return groups.filter(Boolean).join(" ");
}

export function detectCardBrand(value) {
  const digits = normalizeCardNumber(value);

  const match = Object.entries(CARD_BRANDS).find(([, brand]) =>
    brand.pattern.test(digits)
  );

  return match ? match[0] : null;
}

/**
 * Luhn algoritması. Bir kart numarasının yazım hatası içerip içermediğini
 * yakalar — kartın gerçekten var olduğunu KANITLAMAZ, yalnızca rakam
 * dizisinin tutarlı olduğunu gösterir.
 */
export function isLuhnValid(value) {
  const digits = normalizeCardNumber(value);

  if (digits.length < 12) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Sağdan sola: her ikinci rakam iki katına çıkar, 9'u aşarsa 9 çıkarılır.
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function getExpectedCvvLength(cardNumber) {
  const brand = detectCardBrand(cardNumber);
  return brand ? CARD_BRANDS[brand].cvvLength : 3;
}

/** "AA/YY" → { month, year } ya da null. */
export function parseExpiry(value) {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(String(value ?? "").trim());

  if (!match) {
    return null;
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);

  if (month < 1 || month > 12) {
    return null;
  }

  return { month, year };
}

/**
 * Son kullanma tarihi geçmiş mi? Kart, ait olduğu ayın SON gününe kadar
 * geçerlidir — bu yüzden karşılaştırma bir sonraki ayın başına yapılır.
 */
export function isExpiryInPast(value, referenceDate = new Date()) {
  const parsed = parseExpiry(value);

  if (!parsed) {
    return true;
  }

  const expiresAfter = new Date(parsed.year, parsed.month, 1);

  return expiresAfter <= referenceDate;
}

/**
 * Kart formunun tamamını doğrular ve ALAN BAZLI hata sözlüğü döner.
 *
 * Tek bir "kart bilgileri hatalı" mesajı yerine hangi alanın neden reddedildiği
 * söyleniyor; ekranda her mesaj kendi alanına `aria-describedby` ile bağlanıyor.
 */
export function validateCardForm(form, referenceDate = new Date()) {
  const errors = {};

  const holder = String(form.cardHolder ?? "").trim();
  if (holder.length < 3) {
    errors.cardHolder = "Kart sahibinin adı en az 3 karakter olmalıdır.";
  } else if (!/^[\p{L}\s.'-]+$/u.test(holder)) {
    errors.cardHolder = "Kart sahibinin adı yalnızca harf içerebilir.";
  }

  const digits = normalizeCardNumber(form.cardNumber);
  const brand = detectCardBrand(digits);

  if (digits.length === 0) {
    errors.cardNumber = "Kart numarası zorunludur.";
  } else if (!brand) {
    errors.cardNumber = "Bu kart numarası tanınan bir karta ait değil.";
  } else if (!CARD_BRANDS[brand].lengths.includes(digits.length)) {
    const expected = CARD_BRANDS[brand].lengths.join(" veya ");
    errors.cardNumber = `${CARD_BRANDS[brand].label} kartları ${expected} haneli olmalıdır.`;
  } else if (!isLuhnValid(digits)) {
    errors.cardNumber = "Kart numarası geçersiz. Rakamları kontrol edin.";
  }

  if (!parseExpiry(form.expiry)) {
    errors.expiry = "Son kullanma tarihi AA/YY biçiminde olmalıdır.";
  } else if (isExpiryInPast(form.expiry, referenceDate)) {
    errors.expiry = "Kartın son kullanma tarihi geçmiş.";
  }

  const cvv = String(form.cvv ?? "").trim();
  const expectedCvvLength = getExpectedCvvLength(digits);

  if (!/^\d+$/.test(cvv)) {
    errors.cvv = "Güvenlik kodu yalnızca rakamlardan oluşur.";
  } else if (cvv.length !== expectedCvvLength) {
    errors.cvv = brand
      ? `${CARD_BRANDS[brand].label} kartlarında güvenlik kodu ${expectedCvvLength} hanelidir.`
      : `Güvenlik kodu ${expectedCvvLength} haneli olmalıdır.`;
  }

  return errors;
}
