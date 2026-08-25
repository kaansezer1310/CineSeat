/**
 * Yükleniyor / hata / yetkisiz durumlarının tek biçimi.
 *
 * Bu üç durum her ekranda ayrı ayrı uydurulmuştu: kimi yerde düz bir <p>,
 * kimi yerde `temporary-panel`, kimi yerde hiç. Sonuç: aynı durum farklı
 * görünüyor ve hata mesajları bazı ekranlarda ekran okuyucuya hiç
 * duyurulmuyordu.
 *
 * Props:
 * - variant: "loading" | "error" | "forbidden"
 * - title: başlık (varsayılanı varyanttan gelir)
 * - description: açıklama; hata varyantında genelde `error.message`
 * - action: opsiyonel eylem (ör. "Tekrar Dene")
 */
const VARIANT_DEFAULTS = {
  loading: { icon: "", title: "Yükleniyor…", role: "status" },
  error: { icon: "⚠️", title: "Bir şeyler ters gitti", role: "alert" },
  forbidden: { icon: "🔒", title: "Bu içeriği görme yetkiniz yok", role: "alert" },
};

function StatusPanel({
  variant = "loading",
  title,
  description,
  action,
  className = "",
}) {
  const defaults = VARIANT_DEFAULTS[variant] ?? VARIANT_DEFAULTS.loading;

  return (
    <div
      className={`status-panel status-panel-${variant} ${className}`.trim()}
      role={defaults.role}
      // Yükleniyor durumu sözü kesmemeli; hata kesmeli.
      aria-live={variant === "loading" ? "polite" : "assertive"}
    >
      {variant === "loading" ? (
        <span className="status-panel-spinner" aria-hidden="true" />
      ) : (
        defaults.icon && (
          <span className="status-panel-icon" aria-hidden="true">
            {defaults.icon}
          </span>
        )
      )}

      <p className="status-panel-title">{title ?? defaults.title}</p>

      {description && (
        <p className="status-panel-description">{description}</p>
      )}

      {action && <div className="status-panel-action">{action}</div>}
    </div>
  );
}

export default StatusPanel;
