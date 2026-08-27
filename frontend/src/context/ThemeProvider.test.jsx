import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import ThemeProvider from "./ThemeProvider.jsx";
import useTheme from "../hooks/useTheme.js";

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        Temayı değiştir
      </button>
    </div>
  );
}

function renderProbe() {
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("localStorage boşken varsayılan olarak light temayı seçer", () => {
    renderProbe();

    expect(screen.getByTestId("theme-value")).toHaveTextContent("light");
  });

  it("localStorage'da dark kayıtlıysa dark temayı seçer", () => {
    localStorage.setItem("cineseat_theme", "dark");

    renderProbe();

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
  });

  it("toggleTheme temayı değiştirir ve localStorage'a yazar", () => {
    renderProbe();

    fireEvent.click(
      screen.getByRole("button", { name: "Temayı değiştir" })
    );

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
    expect(localStorage.getItem("cineseat_theme")).toBe("dark");
  });
});
