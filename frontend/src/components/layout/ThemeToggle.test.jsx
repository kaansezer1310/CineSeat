import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ThemeProvider from "../../context/ThemeProvider.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

function renderToggle() {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe("ThemeToggle", () => {
  it("varsayılan light temada koyu temaya geçiş etiketini gösterir", () => {
    renderToggle();

    expect(
      screen.getByRole("button", { name: "Koyu temaya geç" })
    ).toBeInTheDocument();
  });

  it("tıklanınca temayı değiştirir ve etiketi günceller", () => {
    renderToggle();

    fireEvent.click(
      screen.getByRole("button", { name: "Koyu temaya geç" })
    );

    expect(
      screen.getByRole("button", { name: "Açık temaya geç" })
    ).toBeInTheDocument();
  });
});
