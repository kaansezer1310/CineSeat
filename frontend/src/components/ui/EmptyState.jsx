/**
 * Boş durum — "henüz kayıt yok" ekranı. Kullanıcıyı bir sonraki adıma
 * çağırabilmesi için opsiyonel bir eylem alanı taşır.
 *
 * Props:
 * - icon: node — dekoratif; ekran okuyucudan gizlenir
 * - title: string | node — zorunlu
 * - description: string | node — opsiyonel
 * - action: node — opsiyonel eylem (buton/link)
 */
function EmptyState({ icon, title, description, action, className = "" }) {
  return (
    <div className={`empty-state ${className}`.trim()} role="status">
      {icon && (
        <span className="empty-state-icon" aria-hidden="true">
          {icon}
        </span>
      )}

      <p className="empty-state-title">{title}</p>

      {description && (
        <p className="empty-state-description">{description}</p>
      )}

      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

export default EmptyState;
