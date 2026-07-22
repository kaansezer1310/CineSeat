import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Zaten giriş yapılmışsa ana sayfaya yönlendir
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Kullanıcı yazmaya başladığında hatayı temizle
    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basit boşluk kontrolü
    if (!formData.email.trim() || !formData.password) {
      setError("E-posta ve şifre alanlarını doldurunuz.");
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      navigate("/", { replace: true });
    } catch (err) {
      // REQ-21: Genel hata mesajı (alan belirtmeden)
      setError(err.message || "E-posta veya şifre hatalı.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Giriş Yap</h1>
          <p>CineSeat hesabınıza giriş yapın</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">E-posta</label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ornek@cineseat.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Şifre</label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Şifrenizi giriniz"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="primary-button auth-submit"
            disabled={isLoading}
          >
            {isLoading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>

        <p className="auth-footer-text">
          Hesabınız yok mu?{" "}
          <Link to="/register" className="auth-link">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
