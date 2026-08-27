import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useTabs from "./useTabs.js";

const TAB_IDS = ["bir", "iki", "uc"];

function Harness() {
  const { activeTab, getTabProps, getPanelProps } = useTabs(TAB_IDS, {
    idPrefix: "test",
  });

  return (
    <div>
      <div role="tablist">
        {TAB_IDS.map((id) => (
          <button key={id} {...getTabProps(id)}>
            {id}
          </button>
        ))}
      </div>

      <div {...getPanelProps(activeTab)}>{activeTab} içeriği</div>
    </div>
  );
}

describe("useTabs", () => {
  it("ilk sekmeyi seçili başlatır", () => {
    render(<Harness />);

    expect(screen.getByRole("tab", { name: "bir" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("bir içeriği");
  });

  it("sekmeyi paneline aria-controls / aria-labelledby ile bağlar", () => {
    render(<Harness />);

    const tab = screen.getByRole("tab", { name: "bir" });
    const panel = screen.getByRole("tabpanel");

    expect(tab).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", tab.id);
  });

  it("roving tabindex uygular: yalnızca aktif sekme Tab sırasındadır", () => {
    render(<Harness />);

    expect(screen.getByRole("tab", { name: "bir" })).toHaveAttribute(
      "tabindex",
      "0"
    );
    expect(screen.getByRole("tab", { name: "iki" })).toHaveAttribute(
      "tabindex",
      "-1"
    );
  });

  it("tıklamayla sekme değiştirir", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("tab", { name: "iki" }));

    expect(screen.getByRole("tab", { name: "iki" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("iki içeriği");
  });

  it("ArrowRight sonraki sekmeye geçer ve odağı taşır", () => {
    render(<Harness />);

    fireEvent.keyDown(screen.getByRole("tab", { name: "bir" }), {
      key: "ArrowRight",
    });

    const ikinci = screen.getByRole("tab", { name: "iki" });

    expect(ikinci).toHaveAttribute("aria-selected", "true");
    expect(ikinci).toHaveFocus();
  });

  it("ArrowLeft ilk sekmeden sonuncuya sarar", () => {
    render(<Harness />);

    fireEvent.keyDown(screen.getByRole("tab", { name: "bir" }), {
      key: "ArrowLeft",
    });

    expect(screen.getByRole("tab", { name: "uc" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("Home ve End uçlara gider", () => {
    render(<Harness />);

    fireEvent.keyDown(screen.getByRole("tab", { name: "bir" }), {
      key: "End",
    });
    expect(screen.getByRole("tab", { name: "uc" })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    fireEvent.keyDown(screen.getByRole("tab", { name: "uc" }), {
      key: "Home",
    });
    expect(screen.getByRole("tab", { name: "bir" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("ilgisiz tuşları yok sayar", () => {
    render(<Harness />);

    fireEvent.keyDown(screen.getByRole("tab", { name: "bir" }), {
      key: "a",
    });

    expect(screen.getByRole("tab", { name: "bir" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});
