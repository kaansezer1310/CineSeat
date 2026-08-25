import { useCallback, useMemo, useRef, useState } from "react";

import ToastContext from "./ToastContext.js";

/**
 * Engellemeyen bildirimler — `alert()` yerine.
 *
 * `alert()` sayfayı bloklar, temaya uymaz ve arka arkaya iki mesaj vermek
 * gerektiğinde kullanıcıyı iki kez durdurur. Toast'lar üst üste binebilir ve
 * kendiliğinden kaybolur.
 *
 * Erişilebilirlik: bildirim bölgesi `aria-live` ile duyurulur. Hata mesajları
 * "assertive" (ekran okuyucu sözü keser), başarı/bilgi "polite".
 */
const DEFAULT_DURATION = 4000;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());
  const nextIdRef = useRef(1);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    ({ message, variant = "info", duration = DEFAULT_DURATION }) => {
      const id = nextIdRef.current;
      nextIdRef.current += 1;

      setToasts((current) => [...current, { id, message, variant }]);

      if (duration > 0) {
        timersRef.current.set(
          id,
          setTimeout(() => dismissToast(id), duration)
        );
      }

      return id;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
      // Sık kullanılan iki kısayol; çağrı yerlerinde variant yazmak gerekmesin.
      showSuccess: (message) => showToast({ message, variant: "success" }),
      showError: (message) => showToast({ message, variant: "error" }),
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-region">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.variant}`}
            role={toast.variant === "error" ? "alert" : "status"}
            aria-live={toast.variant === "error" ? "assertive" : "polite"}
          >
            <span className="toast-message">{toast.message}</span>

            <button
              type="button"
              className="toast-dismiss"
              onClick={() => dismissToast(toast.id)}
              aria-label="Bildirimi kapat"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
