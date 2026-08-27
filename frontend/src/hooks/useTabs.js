import { useRef, useState } from "react";

/**
 * Faz 6 (a11y turu) — WAI-ARIA "Tabs" deseninin eksiksiz hâli.
 *
 * MoviesPage ve ProfilePage `role="tablist"` + `role="tab"` yazıyordu ama
 * desenin geri kalanı eksikti:
 *
 * - `role="tabpanel"` yoktu → ekran okuyucu "sekme" diyordu, sekmenin NEYİ
 *   kontrol ettiğini söyleyemiyordu.
 * - `aria-controls` / `aria-labelledby` bağı yoktu.
 * - Ok tuşlarıyla gezinme yoktu; her sekme ayrı bir Tab durağıydı. ARIA
 *   deseninde sekme şeridi TEK durak olmalı, sekmeler arasında ok
 *   tuşlarıyla gezilmelidir (roving tabindex).
 *
 * Kullanım:
 *   const { activeTab, setActiveTab, getTabProps, getPanelProps } =
 *     useTabs(["info", "tickets"], { idPrefix: "profile" });
 *
 * @param {string[]} tabIds  Sekme kimlikleri, görsel sırayla.
 * @param {{ idPrefix: string, initialTab?: string }} options
 */
function useTabs(tabIds, { idPrefix, initialTab } = {}) {
  const [activeTab, setActiveTab] = useState(initialTab ?? tabIds[0]);
  const tabRefs = useRef({});

  function focusTab(id) {
    setActiveTab(id);
    // Roving tabindex: seçilen sekme aynı zamanda odağı da almalı, aksi
    // hâlde klavye kullanıcısı seçtiği sekmeyi "kaybeder".
    tabRefs.current[id]?.focus();
  }

  function handleKeyDown(event) {
    const currentIndex = tabIds.indexOf(activeTab);

    if (currentIndex === -1) {
      return;
    }

    let nextIndex = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % tabIds.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = tabIds.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    // Ok tuşları sekme şeridinde gezinme içindir; sayfanın yatay
    // kaymasını tetiklemesinler.
    event.preventDefault();
    focusTab(tabIds[nextIndex]);
  }

  function getTabProps(id) {
    const isActive = id === activeTab;

    return {
      id: `${idPrefix}-tab-${id}`,
      role: "tab",
      type: "button",
      "aria-selected": isActive,
      "aria-controls": `${idPrefix}-panel-${id}`,
      // Şerit tek Tab durağı: yalnızca aktif sekme sıraya girer.
      tabIndex: isActive ? 0 : -1,
      ref: (node) => {
        tabRefs.current[id] = node;
      },
      onClick: () => setActiveTab(id),
      onKeyDown: handleKeyDown,
    };
  }

  function getPanelProps(id) {
    return {
      id: `${idPrefix}-panel-${id}`,
      role: "tabpanel",
      "aria-labelledby": `${idPrefix}-tab-${id}`,
      // Panelin kendisi odaklanabilir olmalı: içinde odaklanacak bir öğe
      // yoksa klavye kullanıcısı panele hiç ulaşamazdı.
      tabIndex: 0,
    };
  }

  return { activeTab, setActiveTab, getTabProps, getPanelProps };
}

export default useTabs;
