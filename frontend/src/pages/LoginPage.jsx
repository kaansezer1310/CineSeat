import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { validateLoginForm } from "../services/validation.js";
import AuthAside from "../components/auth/AuthAside.jsx";

import "./auth.css";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isSessionExpired } = useAuth();

  // Y2: korumalı bir sayfadan buraya yönlendirilen kullanıcı, giriş
  // yaptıktan sonra ana sayfaya değil gitmek istediği sayfaya döner.
  const from = location.state?.from;
  const redirectTarget = from?.pathname
    ? `${from.pathname}${from.search ?? ""}`
    : "/";
  const wasRedirected = location.state?.reason === "login-required";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Zaten giriş yapılmışsa hedefe (yoksa ana sayfaya) yönlendir.
  useEffect(() => {
    if (user) {
      navigate(redirectTarget, { replace: true });
    }
  }, [user, navigate, redirectTarget]);

  if (user) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      // REQ-21: Genel hata mesajı (alan belirtmeden)
      setGeneralError(err.message || "E-posta veya şifre hatalı.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="auth-panel">
        <div className="auth-header">
          <h1>Giriş Yap</h1>
          <p>CineSeat hesabınıza giriş yapın</p>
        </div>

        {isSessionExpired && !generalError && (
          <div className="auth-notice" role="status">
            Oturumunuzun süresi doldu. Devam etmek için yeniden giriş yapın.
          </div>
        )}

        {wasRedirected && !isSessionExpired && !generalError && (
          <div className="auth-notice" role="status">
            Bu sayfayı görüntülemek için önce giriş yapmalısınız. Giriş
            yaptıktan sonra kaldığınız yerden devam edeceksiniz.
          </div>
        )}

        {generalError && (
          <div className="auth-error" role="alert">
            {generalError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">E-posta</label>
            <input
              id="login-email"
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ornek@cineseat.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && (
              <span className="auth-field-error">{errors.email}</span>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Şifre</label>
            <input
              id="login-password"
              className="input"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Şifrenizi giriniz"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && (
              <span className="auth-field-error">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--lg auth-submit"
            disabled={isLoading}
          >
            {isLoading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>

        <p className="auth-footer-text">
          Hesabınız yok mu?{" "}
          <Link
            to="/register"
            state={from ? { from } : undefined}
            className="auth-link"
          >
            Kayıt Ol
          </Link>
        </p>
      </div>

      <AuthAside
        title="Koltuğun seni bekliyor."
        text="Giriş yap, biletlerini tek yerden takip et ve izleme listendeki filmler vizyona girdiğinde ilk sen haberdar ol."
      />
    </section>
  );
}

export default LoginPage;
