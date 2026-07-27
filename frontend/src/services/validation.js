/**
 * Sprint 3 / 1.2.2 — Form doğrulama kuralları ve regex (REQ-16, REQ-17, Güvenlik 4.2)
 *
 * Kurallar:
 * - Kullanıcı adı: 5–12 karakter, sadece İngilizce harf ve rakam (Türkçe/boşluk/özel karakter yasak)
 * - Şifre: 6–15, en az bir harf + bir rakam, izinli özel karakterler: !@#$%^&*
 * - Ad / Soyad: 2–50 karakter
 * - E-posta: temel format doğrulaması (x@y.z)
 */

// Kullanıcı adı: yalnızca İngilizce harf ve rakam, 5-12 karakter
const USERNAME_REGEX = /^[A-Za-z0-9]{5,12}$/;

// Şifre: 6-15 karakter, en az bir harf, en az bir rakam
// İzinli karakterler: harf, rakam ve !@#$%^&*
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{6,15}$/;

// E-posta: temel format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login formu doğrulama
 */
export function validateLoginForm(formData) {
  const errors = {};

  if (!formData.email || !formData.email.trim()) {
    errors.email = "E-posta zorunludur.";
  } else if (!EMAIL_REGEX.test(formData.email.trim())) {
    errors.email = "Geçerli bir e-posta adresi giriniz.";
  }

  if (!formData.password) {
    errors.password = "Şifre zorunludur.";
  }

  return errors;
}

/**
 * Register formu doğrulama
 */
export function validateRegisterForm(formData) {
  const errors = {};

  // Ad: 2-50 karakter
  if (!formData.firstName || !formData.firstName.trim()) {
    errors.firstName = "Ad zorunludur.";
  } else if (formData.firstName.trim().length < 2) {
    errors.firstName = "Ad en az 2 karakter olmalıdır.";
  } else if (formData.firstName.trim().length > 50) {
    errors.firstName = "Ad en fazla 50 karakter olabilir.";
  }

  // Soyad: 2-50 karakter
  if (!formData.lastName || !formData.lastName.trim()) {
    errors.lastName = "Soyad zorunludur.";
  } else if (formData.lastName.trim().length < 2) {
    errors.lastName = "Soyad en az 2 karakter olmalıdır.";
  } else if (formData.lastName.trim().length > 50) {
    errors.lastName = "Soyad en fazla 50 karakter olabilir.";
  }

  // E-posta
  if (!formData.email || !formData.email.trim()) {
    errors.email = "E-posta zorunludur.";
  } else if (!EMAIL_REGEX.test(formData.email.trim())) {
    errors.email = "Geçerli bir e-posta adresi giriniz.";
  }

  // Kullanıcı adı: 5-12, sadece İngilizce harf ve rakam
  if (!formData.username || !formData.username.trim()) {
    errors.username = "Kullanıcı adı zorunludur.";
  } else if (!USERNAME_REGEX.test(formData.username.trim())) {
    errors.username =
      "Kullanıcı adı 5–12 karakter, sadece İngilizce harf ve rakam olmalıdır.";
  }

  // Şifre: 6-15, en az bir harf + bir rakam
  if (!formData.password) {
    errors.password = "Şifre zorunludur.";
  } else if (!PASSWORD_REGEX.test(formData.password)) {
    errors.password =
      "Şifre 6–15 karakter, en az bir harf ve bir rakam içermelidir.";
  }

  // Şifre tekrar
  if (!formData.passwordConfirm) {
    errors.passwordConfirm = "Şifre tekrarı zorunludur.";
  } else if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = "Şifreler eşleşmiyor.";
  }

  return errors;
}
