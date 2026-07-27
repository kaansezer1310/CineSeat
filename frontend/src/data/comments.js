// Mock yorum verisi — 1.3.11'in "boş durum" değil, gerçek listelenebilir bir
// durumu da gösterebilmesi için en az bir filme (id: 1) örnek yorum eklendi.
// userId, src/data/users.js'teki mock kullanıcılara referans verir.
const comments = [
  {
    id: "seed-1",
    movieId: 1,
    userId: 2,
    userName: "Kaan Sezer",
    text: "Görsel efektler harikaydı, özellikle son sahnedeki anı aktarım sekansı gerçekten etkileyiciydi.",
    createdAt: "2026-07-14T10:00:00.000Z",
  },
  {
    id: "seed-2",
    movieId: 1,
    userId: 4,
    userName: "Berke",
    text: "Hikâye biraz yavaş ilerliyor ama atmosferi çok iyi kurulmuş, izlemeye değer.",
    createdAt: "2026-07-15T18:30:00.000Z",
  },
];

export default comments;
