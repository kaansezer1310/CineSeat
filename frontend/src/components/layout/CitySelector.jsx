import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { cityResource } from "../../services/locationService.js";
import useDismissableOverlay from "../../hooks/useDismissableOverlay.js";

function CitySelector() {
  const navigate = useNavigate();
  const { isOpen, toggle, close, containerRef } = useDismissableOverlay();

  const { data: cities = [] } = useQuery({
    queryKey: ["cities"],
    queryFn: () => cityResource.list(),
    staleTime: 30 * 60 * 1000,
  });

  function handleSelect(cityName) {
    close();
    navigate("/cinemas", { state: { city: cityName } });
  }

  return (
    <div className="city-selector" ref={containerRef}>
      <button
        type="button"
        className="chip"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        Şehir Seç
      </button>

      {isOpen && (
        <div className="dropdown-panel" role="menu">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              className="dropdown-item"
              role="menuitem"
              onClick={() => handleSelect(city.name)}
            >
              {city.name}
            </button>
          ))}

          {cities.length === 0 && (
            <p className="city-selector-empty">Şehir bulunamadı</p>
          )}
        </div>
      )}
    </div>
  );
}

export default CitySelector;
