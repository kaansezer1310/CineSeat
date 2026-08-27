import { Link } from "react-router-dom";

import "./Rail.css";

function Rail({
  title,
  viewAllHref,
  viewAllLabel = "Tümünü gör →",
  ariaLabel,
  children,
}) {
  return (
    <section className="rail-section" aria-label={ariaLabel ?? title}>
      {(title || viewAllHref) && (
        <div className="rail-section-heading">
          {title && <h2 className="rail-section-title">{title}</h2>}

          {viewAllHref && (
            <Link to={viewAllHref} className="rail-section-link">
              {viewAllLabel}
            </Link>
          )}
        </div>
      )}

      <div className="rail" role="list">
        {children}
      </div>
    </section>
  );
}

export default Rail;
