import { useEffect, useRef, useState } from "react";

/**
 * Aç/kapa state'i + dışarı tıklama + Escape ile kapanma — UserMenu,
 * CitySelector ve MobileMenu'nün paylaştığı ortak açılır-panel deseni.
 * `containerRef` bağlanmazsa (tam ekran overlay'ler gibi) dışarı-tıklama
 * kontrolü sessizce devre dışı kalır; Escape her durumda çalışır.
 * Açılış anındaki odaklı eleman hatırlanır ve kapanışta ona geri
 * odaklanılır (WCAG 2.4.3 — odak kaybolmasın).
 */
function useDismissableOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const triggerRef = useRef(null);

  function open() {
    triggerRef.current = document.activeElement;
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function toggle() {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        triggerRef.current = document.activeElement;
      }
      return next;
    });
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
