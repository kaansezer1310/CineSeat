import { useEffect, useRef, useState } from "react";

/**
 * Aç/kapa state'i + dışarı tıklama + Escape ile kapanma — UserMenu,
 * CitySelector ve MobileMenu'nün paylaştığı ortak açılır-panel deseni.
 * `containerRef` bağlanmazsa (tam ekran overlay'ler gibi) dışarı-tıklama
 * kontrolü sessizce devre dışı kalır; Escape her durumda çalışır.
 */
function useDismissableOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  function open() {
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function toggle() {
    setIsOpen((prev) => !prev);
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        close();
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return { isOpen, open, close, toggle, containerRef };
}

export default useDismissableOverlay;
