import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

/**
 * Sprint 2 / 1.2.1 — Kayıt sayfası (REQ-16, REQ-21)
 *
 * Zorunlu: Ad, Soyad, E-posta, Kullanıcı Adı, Şifre, Şifre(Tekrar)
 * Opsiyonel: Telefon, Cinsiyet
 *
 * Benzersizlik: e-posta + kullanıcı adı (authService'te kontrol edilir)
 * Şifre eşleşmesi: client-side kontrol
 */

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  passwordConfirm: "",
  phone: "",
  gender: "",
};

function RegisterPage() {
  const navigate = useNavigate();
  const { register, user } = useAuth();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Zaten giriş yapılmışsa ana sayfaya yönlendir
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Kullanıcı yazmaya başladığında o alanın hatasını temizle
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  /**
   * Client-side form doğrulama.
   * Sprint 3'te (1.2.2) regex bazlı detaylı doğrulama eklenecek;
   * şu an temel zorunlu alan + şifre eşleşme kontrolü yapılıyor.
   */
  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Ad zorunludur.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Soyad zorunludur.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-posta zorunludur.";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Kullanıcı adı zorunludur.";
    }

    if (!formData.password) {
      newErrors.password = "Şifre zorunludur.";
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = "Şifre tekrarı zorunludur.";
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Şifreler eşleşmiyor.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        gender: formData.gender,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setGeneralError(err.message || "Kayıt işlemi başarısız oldu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card auth-card--wide">
        <div className="auth-header">
          <h1>Kayıt Ol</h1>
          <p>Yeni bir CineSeat hesabı oluşturun</p>
        </div>

        {generalError && (
          <div className="auth-error" role="alert">
            {generalError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Ad - Soyad yan yana */}
          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="reg-firstName">
                Ad <span className="auth-required">*</span>
              </label>
              <input
                id="reg-firstName"
                type="text"
                name="firstName"
                autoComplete="given-name"
                placeholder="Adınız"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.firstName && (
                <span className="auth-field-error">{errors.firstName}</span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="reg-lastName">
                Soyad <span className="auth-required">*</span>
              </label>
              <input
                id="reg-lastName"
                type="text"
                name="lastName"
                autoComplete="family-name"
                placeholder="Soyadınız"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.lastName && (
                <span className="auth-field-error">{errors.lastName}</span>
              )}
            </div>
          </div>

          {/* E-posta */}
          <div className="auth-field">
            <label htmlFor="reg-email">
              E-posta <span className="auth-required">*</span>
            </label>
            <input
              id="reg-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ornek@cineseat.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="auth-field-error">{errors.email}</span>
            )}
          </div>

          {/* Kullanıcı Adı */}
          <div className="auth-field">
            <label htmlFor="reg-username">
              Kullanıcı Adı <span className="auth-required">*</span>
            </label>
            <input
              id="reg-username"
              type="text"
              name="username"
              autoComplete="username"
              placeholder="kullaniciadi"
              value={formData.username}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.username && (
              <span className="auth-field-error">{errors.username}</span>
            )}
          </div>

          {/* Şifre - Şifre Tekrar yan yana */}
          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="reg-password">
                Şifre <span className="auth-required">*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Şifreniz"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.password && (
                <span className="auth-field-error">{errors.password}</span>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="reg-passwordConfirm">
                Şifre (Tekrar) <span className="auth-required">*</span>
              </label>
              <input
                id="reg-passwordConfirm"
                type="password"
                name="passwordConfirm"
                autoComplete="new-password"
                placeholder="Şifrenizi tekrar giriniz"
                value={formData.passwordConfirm}
                onChange={handleChange}
                disabled={isLoading}
              />
              {errors.passwordConfirm && (
                <span className="auth-field-error">
                  {errors.passwordConfirm}
                </span>
              )}
            </div>
          </div>

          {/* Telefon - Cinsiyet yan yana (opsiyonel) */}
          <div className="auth-row">
            <div className="auth-field">
              <label htmlFor="reg-phone">Telefon</label>
              <input
                id="reg-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="05XX XXX XX XX"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="auth-field">
              <label htmlFor="reg-gender">Cinsiyet</label>
              <select
                id="reg-gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="">Belirtmek istemiyorum</option>
                <option value="male">Erkek</option>
                <option value="female">Kadın</option>
                <option value="other">Diğer</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={isLoading}
          >
            {isLoading ? "Kayıt yapılıyor…" : "Kayıt Ol"}
          </button>
        </form>

        <p className="auth-footer-text">
          Zaten hesabınız var mı?{" "}
          <Link to="/login" className="auth-link">
            Giriş Yap
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
