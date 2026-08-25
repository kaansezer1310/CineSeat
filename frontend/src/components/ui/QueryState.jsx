import StatusPanel from "./StatusPanel.jsx";

/**
 * react-query sonucunu standart durum panellerine bağlar.
 *
 * Kullanım:
 *   <QueryState isLoading={isLoading} error={error} onRetry={refetch}>
 *     {içerik}
 *   </QueryState>
 *
 * 403, "bir şeyler ters gitti" değil "yetkiniz yok" demektir — ayrımı burada
 * tek yerde yapıyoruz ki her ekran ayrıca düşünmek zorunda kalmasın.
 */
function QueryState({
  isLoading,
  error,
  loadingText,
  onRetry,
  children,
}) {
  if (isLoading) {
    return <StatusPanel variant="loading" title={loadingText} />;
  }

  if (error) {
    const isForbidden = error.status === 403;

    return (
      <StatusPanel
        variant={isForbidden ? "forbidden" : "error"}
        description={error.message}
        action={
          !isForbidden && onRetry ? (
            <button
              type="button"
              className="secondary-button"
              onClick={() => onRetry()}
            >
              Tekrar Dene
            </button>
          ) : null
        }
      />
    );
  }

  return children;
}

export default QueryState;
