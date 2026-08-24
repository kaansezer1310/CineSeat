/**
 * Sayfa başlığı — başlık, açıklama ve birincil eylem için tek düzen.
 *
 * Her ekranın kendi başlık kombinasyonunu uydurması, panelin "bitmemiş"
 * hissinin somut sebebiydi (bkz. FRONTEND_DENETIM_VE_PLAN §3.5).
 *
 * Props:
 * - title: string | node — zorunlu
 * - description: string | node — opsiyonel alt açıklama
 * - actions: node — sağda duran eylem(ler); yoksa alan hiç render edilmez
 * - as: "h1" | "h2" — başlık seviyesi (varsayılan h1)
 */
function PageHeader({
  title,
  description,
  actions,
  as: Heading = "h1",
  className = "",
}) {
  return (
    <div className={`page-header ${className}`.trim()}>
      <div className="page-header-text">
        <Heading className="page-header-title">{title}</Heading>

        {description && (
          <p className="page-header-description">{description}</p>
        )}
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}

export default PageHeader;
