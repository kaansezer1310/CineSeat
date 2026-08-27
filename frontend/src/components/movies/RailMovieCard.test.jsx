import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import RailMovieCard from "./RailMovieCard.jsx";

function isoDateOffsetFromToday(daysOffset) {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const RELEASED_MOVIE = {
  id: 1,
  title: "Neon Yağmuru",
  genre: "Cyberpunk Dram",
  poster: "/posters/neon-yagmuru.png",
  releaseDate: isoDateOffsetFromToday(-3),
};

const UPCOMING_MOVIE = {
  id: 2,
  title: "Gelecek Filmi",
  genre: "Bilim Kurgu",
  poster: "/posters/gelecek.png",
  releaseDate: isoDateOffsetFromToday(3),
};

describe("RailMovieCard", () => {
  it("vizyondaki film için tür bilgisini gösterir", () => {
    render(<RailMovieCard movie={RELEASED_MOVIE} onSelect={vi.fn()} />);

    expect(screen.getByText("Neon Yağmuru")).toBeInTheDocument();
    expect(screen.getByText("Cyberpunk Dram")).toBeInTheDocument();
  });

  it("yakında vizyona girecek film için kalan gün sayısını gösterir", () => {
    render(<RailMovieCard movie={UPCOMING_MOVIE} onSelect={vi.fn()} />);

    expect(screen.getByText("3 gün sonra")).toBeInTheDocument();
  });

  it("tıklanınca onSelect'i film id'siyle çağırır", () => {
    const handleSelect = vi.fn();
    render(
      <RailMovieCard movie={RELEASED_MOVIE} onSelect={handleSelect} />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it("listitem rolüyle render edilir (Rail'in role=list konteynerine uyum için)", () => {
    render(<RailMovieCard movie={RELEASED_MOVIE} onSelect={vi.fn()} />);

    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });
});
