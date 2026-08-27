import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import useDismissableOverlay from "./useDismissableOverlay.js";

function Harness() {
  const { isOpen, toggle, close, containerRef } = useDismissableOverlay();

  return (
    <div>
      <button type="button" onClick={toggle}>
        Aç/Kapa
      </button>

      <div ref={containerRef} data-testid="container">
        {isOpen && (
          <div data-testid="panel">
            <button type="button">İçerideki buton</button>
          </div>
        )}
      </div>

      <button type="button" onClick={close}>
        Elle kapat
      </button>

      <button type="button" data-testid="outside">
        Dışarıdaki buton
      </button>
    </div>
  );
}

describe("useDismissableOverlay", () => {
  it("başlangıçta kapalıdır", () => {
    render(<Harness />);

    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });

  it("toggle ile açılır ve kapanır", () => {
    render(<Harness />);

    fireEvent.click(screen.getByText("Aç/Kapa"));
    expect(screen.getByTestId("panel")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Aç/Kapa"));
    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });

  it("konteynerin dışına tıklanınca kapanır", () => {
    render(<Harness />);

    fireEvent.click(screen.getByText("Aç/Kapa"));
    expect(screen.getByTestId("panel")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId("outside"));

    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });

  it("konteynerin içine tıklanınca kapanmaz", () => {
    render(<Harness />);

    fireEvent.click(screen.getByText("Aç/Kapa"));
    fireEvent.mouseDown(screen.getByText("İçerideki buton"));

    expect(screen.getByTestId("panel")).toBeInTheDocument();
  });

  it("Escape tuşuna basılınca kapanır", () => {
    render(<Harness />);

    fireEvent.click(screen.getByText("Aç/Kapa"));
    expect(screen.getByTestId("panel")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByTestId("panel")).not.toBeInTheDocument();
  });
});
