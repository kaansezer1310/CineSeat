/**
 * Sayaç kartı — sayı, etiket ve isteğe bağlı değişim göstergesi.
 *
 * Rakamlar `tabular-nums` ile hizalanır (bkz. plan §3.3): kartlar yan yana
 * dururken basamaklar aynı hizada olsun.
 *
 * Props:
 * - label: string — ne ölçüldüğü
 * - value: string | number — gösterilecek değer
 * - suffix: string — "TL", "Adet" gibi birim
 * - change: number — yüzde değişim; pozitif yeşil, negatif kırmızı
 * - changeLabel: string — "geçen aya göre" gibi bağlam
 * - isLoading: boolean — değer yerine iskelet gösterir
 */
function StatCard({
  label,
  value,
  suffix,
  change,
  changeLabel,
  isLoading = false,
}) {
  const hasChange = Number.isFinite(change);

  return (
    <div className="stat-card">
      <h3 className="stat-card-label">{label}</h3>

      {isLoading ? (
        <span className="stat-card-skeleton" aria-hidden="true" />
      ) : (
        <p className="stat-card-value">
          {value}
          {suffix && <span className="stat-card-suffix"> {suffix}</span>}
        </p>
      )}

      {hasChange && !isLoading && (
        <p
          className={
            change >= 0
              ? "stat-card-change stat-card-change-up"
              : "stat-card-change stat-card-change-down"
          }
        >
          <span aria-hidden="true">{change >= 0 ? "▲" : "▼"}</span>{" "}
          {/* İşaret zaten metinde: ekran okuyucu "yüzde eksi 5" duymamalı. */}
          %{Math.abs(change)}
          {changeLabel && (
            <span className="stat-card-change-label"> {changeLabel}</span>
          )}
        </p>
      )}
    </div>
  );
}

export default StatCard;
