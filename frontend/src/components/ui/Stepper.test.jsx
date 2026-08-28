import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Stepper from "./Stepper.jsx";

const STEPS = ["Koltuk", "Bilet Tipi", "Ödeme"];

describe("Stepper", () => {
  it("tüm adımları sırayla gösterir", () => {
    render(<Stepper steps={STEPS} currentStepIndex={0} />);

    const items = screen.getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "1Koltuk",
      "2Bilet Tipi",
      "3Ödeme",
    ]);
  });

  it("geçerli adımı aria-current ile işaretler", () => {
    render(<Stepper steps={STEPS} currentStepIndex={1} />);

    const current = screen.getByText("Bilet Tipi").closest("li");
    expect(current).toHaveAttribute("aria-current", "step");
  });

  it("tamamlanmış adımı onay işaretiyle gösterir", () => {
    render(<Stepper steps={STEPS} currentStepIndex={1} />);

    const completed = screen.getByText("Koltuk").closest("li");
    expect(completed.textContent).toBe("✓Koltuk");
  });

  it("henüz gelmemiş adımı sıra numarasıyla gösterir", () => {
    render(<Stepper steps={STEPS} currentStepIndex={0} />);

    const upcoming = screen.getByText("Ödeme").closest("li");
    expect(upcoming.textContent).toBe("3Ödeme");
  });

  it("ilk adım aktifken tamamlanmış adım göstermez", () => {
    render(<Stepper steps={STEPS} currentStepIndex={0} />);

    const first = screen.getByText("Koltuk").closest("li");
    expect(first.textContent).toBe("1Koltuk");
    expect(first).toHaveAttribute("aria-current", "step");
  });
});
