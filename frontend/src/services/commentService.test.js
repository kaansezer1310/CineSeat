import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./apiClient.js", () => {
  const client = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
  };

  return { default: client, apiClient: client };
});

const { default: apiClient } = await import("./apiClient.js");
const { default: commentService } = await import("./commentService.js");

function commentDto(overrides = {}) {
  return {
    id: 1,
    movieId: 7,
    userId: 2,
    username: "kaan",
    rating: 4,
    content: "Fena değildi.",
    isEdited: false,
    createdAt: "2026-08-01T10:00:00+03:00",
    ...overrides,
  };
}

describe("commentService.getCommentsByMovieId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("film id'siyle sayfalı olarak okur ve arayüz şekline çevirir", async () => {
    apiClient.get.mockResolvedValue({ items: [commentDto()] });

    const comments = await commentService.getCommentsByMovieId(7);

    expect(apiClient.get).toHaveBeenCalledWith(
      "/comments?movieId=7&pageNumber=1&pageSize=50"
    );

    expect(comments[0]).toMatchObject({
      id: 1,
      userName: "kaan",
      rating: 4,
      text: "Fena değildi.",
    });
  });

  it("metni olmayan (yalnızca puan) kaydı boş metne çevirir", async () => {
    // T10: yorum metni isteğe bağlı.
    apiClient.get.mockResolvedValue({
      items: [commentDto({ content: null })],
    });

    const [comment] = await commentService.getCommentsByMovieId(7);

    expect(comment.text).toBe("");
    expect(comment.rating).toBe(4);
  });

  it("boş cevapta çökmez", async () => {
    apiClient.get.mockResolvedValue(null);

    await expect(
      commentService.getCommentsByMovieId(7)
    ).resolves.toEqual([]);
  });
});

describe("commentService.addComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.post.mockResolvedValue(1);
  });

  it("puan ve metni birlikte gönderir", async () => {
    await commentService.addComment(7, {
      rating: 5,
      content: "  Harikaydı.  ",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/comments", {
      movieId: 7,
      rating: 5,
      content: "Harikaydı.",
    });
  });

  it("metin boşsa content null gönderir", async () => {
    await commentService.addComment(7, { rating: 3, content: "   " });

    expect(apiClient.post).toHaveBeenCalledWith("/comments", {
      movieId: 7,
      rating: 3,
      content: null,
    });
  });

  it("metin hiç verilmezse de çalışır", async () => {
    await commentService.addComment(7, { rating: 1 });

    const [, body] = apiClient.post.mock.calls[0];
    expect(body.content).toBeNull();
  });
});

describe("commentService.deleteComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("yorum kimliğiyle siler", async () => {
    apiClient.del.mockResolvedValue(null);

    await commentService.deleteComment(9);

    // Sahibi mi moderatör mü ayrımını backend yapıyor; ayrı uç yok.
    expect(apiClient.del).toHaveBeenCalledWith("/comments/9");
  });
});
