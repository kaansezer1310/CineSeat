import { useId } from "react";

/**
 * Etiket + girdi + hata üçlüsünün tek biçimi.
 *
 * `id` otomatik üretilir ve `htmlFor` ile bağlanır — admin formlarında
 * etiketlerin girdilere hiç bağlanmamış olması yaygın bir eksikti. Hata
 * mesajı `aria-describedby` ile girdiye iliştirilir, `aria-invalid` de
 * ayarlanır; ekran okuyucu alanın hatalı olduğunu duyurur.
 */
function FormField({
  label,
  error,
  hint,
  required = false,
  children,
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {label}
        {required && " *"}
      </label>

      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}

      {hint && <small id={hintId}>{hint}</small>}

      {error && (
        <span className="form-field-error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  );
}

export default FormField;
