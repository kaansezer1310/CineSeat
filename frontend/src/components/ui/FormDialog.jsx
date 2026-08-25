import { useEffect, useRef } from "react";

/**
 * Ekleme/düzenleme formlarını taşıyan modal.
 *
 * `ConfirmDialog` ile aynı erişilebilirlik kurallarını izler (odak tuzağı,
 * Escape, odağın çağırana dönmesi) ama içeriği serbesttir: her admin ekranı
 * kendi alanlarını çocuk olarak verir.
 *
 * Arka plana tıklamak BİLEREK kapatmıyor — yarım doldurulmuş bir formu
 * yanlışlıkla kaybetmek, diyaloğu kapatmak için bir tıklama fazladan
 * yapmaktan daha can sıkıcı.
 */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function FormDialog({
  isOpen,
  title,
  description,
  submitLabel = "Kaydet",
  cancelLabel = "Vazgeç",
  isPending = false,
  error,
  onSubmit,
  onCancel,
  children,
}) {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedRef.current = document.activeElement;

    const focusable = dialogRef.current?.querySelectorAll(FOCUSABLE);
    focusable?.[0]?.focus();

    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleKeyDown(event) {
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

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="dialog-backdrop">
      <div
        ref={dialogRef}
        className="dialog dialog-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="form-dialog-title"
        onKeyDown={handleKeyDown}
      >
        <h2 className="dialog-title" id="form-dialog-title">
          {title}
        </h2>

        {description && (
          <p className="dialog-description">{description}</p>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit?.();
          }}
        >
          <div className="dialog-form-fields">{children}</div>

          {error && (
            <p className="dialog-form-error" role="alert">
              {error}
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
              type="submit"
              className="admin-btn admin-btn-primary"
              disabled={isPending}
            >
              {isPending ? "Kaydediliyor…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormDialog;
