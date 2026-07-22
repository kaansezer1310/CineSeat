import { useEffect, useState } from "react";

// REQ-09.1 — iframe'in gerçekten yüklenip yüklenmediğini tarayıcıda güvenilir
// şekilde tespit etmenin bir yolu yok (çapraz-origin, YouTube gömme
// engellenmesi sessizce başarısız olabilir). Bu yüzden fallback iki katmanlı:
// (1) iframe'in kendi `onError`'ı (bazı tarayıcılarda tetiklenir),
// (2) her zaman görünen "YouTube'da Aç" linki — iframe görünmese bile
// kullanıcının fragmana ulaşmasını garanti eder.
function TrailerModal({ youtubeId, movieTitle, onClose }) {
  const [hasIframeError, setHasIframeError] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <div
      className="trailer-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="trailer-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${movieTitle} fragmanı`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="trailer-modal-close-button"
          type="button"
          onClick={onClose}
          aria-label="Fragmanı kapat"
        >
          ✕
        </button>

        {hasIframeError ? (
          <div className="trailer-modal-fallback">
            <p>Fragman bu sayfada oynatılamadı.</p>

            <a
              className="primary-button"
              href={youtubeWatchUrl}
              target="_blank"
              rel="noreferrer"
            >
              YouTube'da Aç
            </a>
          </div>
        ) : (
          <>
            <div className="trailer-modal-iframe-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                title={`${movieTitle} fragmanı`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onError={() => setHasIframeError(true)}
              />
            </div>

            <a
              className="trailer-modal-fallback-link"
              href={youtubeWatchUrl}
              target="_blank"
              rel="noreferrer"
            >
              Fragman açılmıyorsa YouTube'da izle →
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default TrailerModal;
