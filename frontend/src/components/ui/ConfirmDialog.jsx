import { useCallback, useEffect, useRef } from "react";

/**
 * Onay diyaloğu — `window.confirm()` yerine.
 *
 * Neden yerli `confirm()` değil: sayfayı blokluyor, temaya uymuyor, mobilde
 * kötü duruyor ve metni özelleştirilemiyor ("Sil" mi "Arşivle" mi ayrımı
 * yapılamıyor).
 *
 * Erişilebilirlik:
 * - Açılışta odak diyaloğa girer, kapanışta çağıran öğeye geri döner.
 * - Tab odağı diyaloğun içinde döner (odak tuzağı).
 * - Escape kapatır, arka plana tıklamak kapatır.
 *
 * Props:
 * - isOpen, title, description
 * - confirmLabel / cancelLabel
 * - variant: "default" | "danger" — onay butonunun görünümü
 * - isPending: işlem sürerken butonları kilitler
 * - onConfirm, onCancel
 */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Onayla",
  cancelLabel = "Vazgeç",
  variant = "default",
  isPending = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!focusable || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      // Odak diyaloğun dışına kaçmasın: uçlarda başa/sona sar.
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onCancel]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement;
    confirmButtonRef.current?.focus();

    return () => {
      // Kapanışta odak, diyaloğu açan öğeye döner — klavye kullanıcısı
      // listenin başına savrulmaz.
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        // Yalnızca arka plana (içeriğe değil) tıklandığında kapat.
        if (event.target === event.currentTarget) {
          onCancel?.();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-description" : undefined}
        onKeyDown={handleKeyDown}
      >
        <h2 className="dialog-title" id="confirm-dialog-title">
          {title}
        </h2>

        {description && (
          <p className="dialog-description" id="confirm-dialog-description">
            {description}
          </p>
        )}

        <div className="dialog-actions">
          <button
            type="button"
            className="admin-btn admin-btn-cancel"
            onClick={onCancel}
            disabled={isPending}
          >
            {cancelLabel}
          </button>

          <button
            ref={confirmButtonRef}
            type="button"
            className={
              variant === "danger"
                ? "admin-btn admin-btn-delete"
                : "admin-btn admin-btn-primary"
            }
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "İşleniyor…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
