const movies = [
  {
    id: 1,
    title: "Neon Yağmuru",
    genre: "Cyberpunk Dram",
    duration: 134,
    ageRating: "16+",
    releaseYear: 2026,
    releaseDate: "2026-07-13",
    poster: "/posters/neon-yagmuru.png",
    description:
      "İnsanların anılarını şirketlere kiraladığı bir gelecekte, genç bir arşiv teknisyeni yıllar önce kaybettiği kardeşine ait silinmiş bir kayıt bulur.",
    rating: { average: 4.3, count: 128 },
    fragmanYoutubeId: "dQw4w9WgXcQ",
  },
  {
    id: 2,
    title: "Kalkan",
    genre: "Süper Kahraman",
    duration: 128,
    ageRating: "13+",
    releaseYear: 2026,
    releaseDate: "2026-07-13",
    poster: "/posters/kalkan.png",
    description:
      "Yer çekimini yönlendirebilen genç bir kurtarma pilotu, güçlerinin kaynağını keşfederken şehri büyük bir felaketten korumak zorunda kalır.",
    rating: { average: 3.8, count: 94 },
    fragmanYoutubeId: "dQw4w9WgXcQ",
  },
  {
    id: 3,
    title: "Yanlış Düğün",
    genre: "Komedi",
    duration: 101,
    ageRating: "7+",
    releaseYear: 2026,
    releaseDate: "2026-07-13",
    poster: "/posters/yanlis-dugun.png",
    description:
      "Aynı otelde düzenlenen iki düğünün birbirine karışmasıyla gelinler, damatlar ve aileler kendilerini kontrol edilemez bir karmaşanın içinde bulur.",
    rating: { average: 4.6, count: 210 },
    // Bilinçli olarak boş bırakıldı: REQ-09.1 fallback'ini (fragman yok →
    // buton pasif) gerçek veriyle test edebilmek için.
    fragmanYoutubeId: null,
  },
  {
    id: 4,
    title: "Üçüncü Kat",
    genre: "Korku",
    duration: 109,
    ageRating: "18+",
    releaseYear: 2026,
    releaseDate: "2026-07-13",
    poster: "/posters/ucuncu-kat.png",
    description:
      "Yeni taşındığı apartmanda gerçekte var olmayan bir kata açılan asansörü keşfeden genç bir kadın, binanın geçmişindeki karanlık sırlarla yüzleşir.",
    rating: { average: 3.1, count: 47 },
    fragmanYoutubeId: "dQw4w9WgXcQ",
  },
  {
    id: 5,
    title: "Kayıp Sinyal",
    genre: "Bilim Kurgu",
    duration: 121,
    ageRating: "13+",
    releaseYear: 2026,
    releaseDate: "2026-08-14",
    description:
      "Derin uzaya gönderilen bir keşif ekibiyle iletişim aniden kesilir; Dünya'daki genç bir mühendis son sinyalin ardındaki gerçeği çözmeye çalışır.",
    rating: { average: 0, count: 0 },
    fragmanYoutubeId: "dQw4w9WgXcQ",
  },
  {
    id: 6,
    title: "Sessiz Ev",
    genre: "Gerilim",
    duration: 97,
    ageRating: "16+",
    releaseYear: 2026,
    releaseDate: "2026-10-02",
    description:
      "Kalabalık şehirden taşrada sessiz bir eve taşınan bir aile, evin geçmişiyle ilgili açıklanamayan olaylarla karşı karşıya kalır.",
    rating: { average: 0, count: 0 },
    fragmanYoutubeId: null,
  },
  {
    id: 7,
    title: "Son Tren",
    genre: "Dram",
    duration: 112,
    ageRating: "13+",
    releaseYear: 2026,
    releaseDate: "2026-03-06",
    screeningEndDate: "2026-04-03",
    description:
      "Sınırlı bir gösterim süresiyle vizyona giren bu dram, gece treninde karşılaşan iki yabancının bir daha asla göremeyecekleri şehirlerini geride bırakışını anlatır.",
    rating: { average: 4.0, count: 12 },
    fragmanYoutubeId: "dQw4w9WgXcQ",
  },
];

export default movies;