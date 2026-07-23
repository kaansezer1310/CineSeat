import { beforeEach, describe, expect, it } from "vitest";

import commentService from "./commentService.js";

const testUser = { id: 99, name: "Test Kullanıcı" };
const otherUser = { id: 100, name: "Başka Kullanıcı" };

describe("commentService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getCommentsByMovieId, tohum (seed) yorumları film id'sine göre döner", async () => {
    const comments = await commentService.getCommentsByMovieId(1);

    expect(comments.length).toBeGreaterThan(0);
    expect(
      comments.every((comment) => comment.movieId === 1)
    ).toBe(true);
  });

  it("hiç yorumu olmayan bir film için boş dizi döner", async () => {
    const comments = await commentService.getCommentsByMovieId(999);

    expect(comments).toEqual([]);
  });

  it("addComment, 10 karakterden kısa yorumu reddeder", async () => {
    await expect(
      commentService.addComment(1, testUser, "kısa")
    ).rejects.toThrow(/10-500 karakter/);
  });

  it("addComment, 500 karakterden uzun yorumu reddeder", async () => {
    const longText = "a".repeat(501);

    await expect(
      commentService.addComment(1, testUser, longText)
    ).rejects.toThrow(/10-500 karakter/);
  });

  it("addComment, yasaklı kelime içeren yorumu reddeder", async () => {
    await expect(
      commentService.addComment(
        1,
        testUser,
        "Bu film gerçekten çok aptalca bir hikayeydi."
      )
    ).rejects.toThrow(/uygunsuz/);
  });

  it("addComment, geçerli yorumu kaydeder ve listede görünür", async () => {
    await commentService.addComment(
      1,
      testUser,
      "Gerçekten güzel bir filmdi, tavsiye ederim."
    );

    const comments = await commentService.getCommentsByMovieId(1);

    expect(
      comments.some(
        (comment) =>
          comment.text ===
          "Gerçekten güzel bir filmdi, tavsiye ederim."
      )
    ).toBe(true);
  });

  it("yeni yorumlar en üstte listelenir (tarihe göre yeniden eskiye)", async () => {
    await commentService.addComment(
      2,
      testUser,
      "İlk eklenen yorum metni budur."
    );
    await new Promise((resolve) => setTimeout(resolve, 5));
    await commentService.addComment(
      2,
      otherUser,
      "İkinci eklenen yorum metni budur."
    );

    const comments = await commentService.getCommentsByMovieId(2);

    expect(comments[0].text).toBe(
      "İkinci eklenen yorum metni budur."
    );
  });

  it("updateComment, yalnızca yorumun sahibi tarafından düzenlenebilir", async () => {
    const created = await commentService.addComment(
      1,
      testUser,
      "Düzenlenecek olan orijinal yorum metni."
    );

    await expect(
      commentService.updateComment(
        created.id,
        otherUser.id,
        "Başkasının yorumunu değiştirmeye çalışıyorum."
      )
    ).rejects.toThrow(/kendi yorumunu/);
  });

  it("updateComment, sahibi tarafından çağrılınca metni günceller", async () => {
    const created = await commentService.addComment(
      1,
      testUser,
      "Düzenlenecek olan orijinal yorum metni."
    );

    const updated = await commentService.updateComment(
      created.id,
      testUser.id,
      "Güncellenmiş yorum metni işte budur."
    );

    expect(updated.text).toBe(
      "Güncellenmiş yorum metni işte budur."
    );
  });

  it("deleteComment, yalnızca yorumun sahibi tarafından silinebilir", async () => {
    const created = await commentService.addComment(
      1,
      testUser,
      "Silinecek olan yorum metni budur işte."
    );

    await expect(
      commentService.deleteComment(created.id, otherUser.id)
    ).rejects.toThrow(/kendi yorumunu/);
  });

  it("deleteComment, sahibi tarafından çağrılınca yorumu kaldırır", async () => {
    const created = await commentService.addComment(
      1,
      testUser,
      "Silinecek olan yorum metni budur işte."
    );

    await commentService.deleteComment(created.id, testUser.id);

    const comments = await commentService.getCommentsByMovieId(1);

    expect(
      comments.some((comment) => comment.id === created.id)
    ).toBe(false);
  });

  it("var olmayan bir yorumu güncellemeye/silmeye çalışmak hata fırlatır", async () => {
    await expect(
      commentService.updateComment(
        "yok-boyle-bir-id",
        testUser.id,
        "Herhangi bir metin buraya yazılabilir."
      )
    ).rejects.toThrow(/bulunamadı/);

    await expect(
      commentService.deleteComment("yok-boyle-bir-id", testUser.id)
    ).rejects.toThrow(/bulunamadı/);
  });
});
