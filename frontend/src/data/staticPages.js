/**
 * Faz 4 — statik sayfa içerikleri (spec §7: /about, /contact, /faq,
 * /privacy, /terms, /kvkk, /refund).
 *
 * İçerik burada, sunum `StaticPage.jsx`'te: yedi sayfanın tamamı tek bir
 * kabuğu paylaşıyor, böylece metin değişikliği JSX'e dokunmadan yapılabiliyor.
 *
 * ÖNEMLİ: Yasal metinler (privacy / terms / kvkk / refund) bu projenin
 * demo kapsamı için yazılmış ÖRNEK metinlerdir; gerçek bir yayına
 * çıkmadan önce hukuk danışmanı tarafından gözden geçirilmelidir.
 *
 * Bölüm biçimleri:
 * - { heading, body: [paragraf, …] }          → normal metin bloğu
 * - { heading, body: [...], list: [madde, …] } → metin + madde listesi
 * - variant: "faq"  → bölümler `<details>` akordeonu olarak render edilir
 * - variant: "contact" → `details` alanı tanım listesi olarak render edilir
 */

const staticPages = {
  about: {
    slug: "about",
    title: "Hakkımızda",
    lead:
      "CineSeat, sinema biletini kuyrukta beklemeden almanı sağlayan bir online bilet platformudur.",
    sections: [
      {
        heading: "Ne yapıyoruz?",
        body: [
          "CineSeat, Türkiye'nin dört bir yanındaki sinema salonlarını tek bir yerde toplar. Vizyondaki ve yakında gelecek filmleri inceleyebilir, sana en yakın salonu bulabilir, koltuğunu salon haritasından kendin seçebilirsin.",
          "Bilet alma akışını olabildiğince kısa tutuyoruz: film seç, koltuk seç, ödemeyi tamamla. Biletin anında hesabına düşer; salona girerken telefonundan göstermen yeterlidir.",
        ],
      },
      {
        heading: "Neye önem veriyoruz?",
        list: [
          "Şeffaf fiyat — sepette gördüğün tutar, ödediğin tutardır.",
          "Koltuk seçme özgürlüğü — salon haritasında boş koltukları gerçek zamanlı görürsün.",
          "Erişilebilirlik — site klavyeyle tam gezinilebilir, ekran okuyucularla uyumludur.",
          "Açık iletişim — bir sorun olduğunda ne olduğunu açıkça söyleriz.",
        ],
      },
      {
        heading: "Bu bir öğrenci projesidir",
        body: [
          "CineSeat bir bitirme/staj projesi olarak geliştirilmektedir. Ödeme akışı simülasyondur: gerçek bir kart çekimi yapılmaz, gerçek bir bilet düzenlenmez. Sitedeki film, salon ve seans verileri örnek verilerdir.",
        ],
      },
    ],
  },

  contact: {
    slug: "contact",
    title: "İletişim",
    lead:
      "Sorun, öneri ya da geri bildirim için bize aşağıdaki kanallardan ulaşabilirsin.",
    variant: "contact",
    details: [
      { label: "E-posta", value: "destek@cineseat.example" },
      { label: "Telefon", value: "0850 000 00 00" },
      { label: "Çalışma saatleri", value: "Hafta içi 09:00 – 18:00" },
      { label: "Adres", value: "Örnek Mah. Sinema Cad. No: 1, İstanbul" },
    ],
    sections: [
      {
        heading: "Bilet ve rezervasyon soruları",
        body: [
          "Mevcut bir biletinle ilgili bir sorun varsa, önce Profilim → Biletlerim ekranından rezervasyon numaranı not al. Bize yazarken bu numarayı iletirsen işlemi çok daha hızlı çözebiliriz.",
        ],
      },
      {
        heading: "Yanıt süresi",
        body: [
          "E-posta ile gelen talepleri genellikle bir iş günü içinde yanıtlıyoruz. Yoğun dönemlerde bu süre iki iş gününe kadar uzayabilir.",
        ],
      },
      {
        heading: "Not",
        body: [
          "Bu bir demo projedir; yukarıdaki iletişim bilgileri örnek amaçlıdır ve gerçek bir destek hattına ait değildir.",
        ],
      },
    ],
  },

  faq: {
    slug: "faq",
    title: "Sıkça Sorulan Sorular",
    lead: "En çok merak edilenleri burada topladık.",
    variant: "faq",
    sections: [
      {
        heading: "Bilet almak için üye olmam gerekiyor mu?",
        body: [
          "Filmleri, seansları ve salonları üye olmadan inceleyebilirsin. Ancak ödeme adımına geçmek için giriş yapman gerekir — biletin hesabına işlenebilmesi ve daha sonra Biletlerim ekranından ulaşabilmen için bu şart.",
        ],
      },
      {
        heading: "Koltuğumu nasıl seçerim?",
        body: [
          "Bir seans seçtiğinde salon haritası açılır. Boş koltuklara tıklayarak seçim yapabilirsin. Başka bir kullanıcı bir koltuğu seçtiyse o koltuk geçici olarak kilitli görünür ve seçilemez.",
        ],
      },
      {
        heading: "Seçtiğim koltuk neden kilitli görünüyor?",
        body: [
          "Bir kullanıcı koltuk seçtiğinde o koltuk kısa bir süre için ona ayrılır; böylece ödeme adımını tamamlarken koltuğu kapılmaz. Süre dolarsa koltuk yeniden herkese açılır.",
        ],
      },
      {
        heading: "Biletimi nereden görebilirim?",
        body: [
          "Ödeme tamamlandıktan sonra biletin Profilim → Biletlerim sekmesine düşer. Seans saati geçen biletler aynı ekranda Geçmiş Biletler başlığı altında listelenir.",
        ],
      },
      {
        heading: "Biletimi iptal edebilir miyim?",
        body: [
          "İptal ve iade koşulları İptal ve İade sayfasında ayrıntılı olarak açıklanmıştır.",
        ],
      },
      {
        heading: "İzleme listesi ne işe yarar?",
        body: [
          "Film kartlarındaki kalp ikonuna tıklayarak bir filmi izleme listene ekleyebilirsin. Listendeki bir film vizyona girdiğinde bunu sana bildiririz.",
        ],
      },
      {
        heading: "Koyu tema var mı?",
        body: [
          "Evet. Sağ üstteki tema düğmesiyle açık ve koyu tema arasında geçiş yapabilirsin; tercihin tarayıcında saklanır.",
        ],
      },
    ],
  },

  privacy: {
    slug: "privacy",
    title: "Gizlilik Politikası",
    lead:
      "Hangi verileri neden topladığımızı ve nasıl kullandığımızı burada açıklıyoruz.",
    sections: [
      {
        heading: "Topladığımız veriler",
        body: [
          "Hesap oluştururken adını, soyadını, e-posta adresini ve kullanıcı adını alırız. Telefon ve cinsiyet alanları isteğe bağlıdır. Bilet aldığında ayrıca rezervasyon bilgilerin (seans, koltuk, tutar) hesabınla ilişkilendirilerek saklanır.",
        ],
      },
      {
        heading: "Verileri ne için kullanıyoruz?",
        list: [
          "Hesabını oluşturmak ve oturumunu açık tutmak",
          "Bilet ve rezervasyon işlemlerini yürütmek",
          "Biletlerini geçmişe dönük olarak sana gösterebilmek",
          "İzleme listendeki bir film vizyona girdiğinde seni bilgilendirmek",
        ],
      },
      {
        heading: "Tarayıcında saklananlar",
        body: [
          "Tema tercihin ve izleme listen tarayıcının yerel deposunda tutulur; bu veriler sunucuya gönderilmez. Oturum bilgin, tarayıcı sekmesi kapandığında silinen oturum deposunda saklanır.",
        ],
      },
      {
        heading: "Üçüncü taraflarla paylaşım",
        body: [
          "Kişisel verilerini pazarlama amacıyla üçüncü taraflarla paylaşmayız ve satmayız.",
        ],
      },
      {
        heading: "Haklarının kullanımı",
        body: [
          "Verilerine erişme, düzeltme ve silinmesini talep etme hakkına sahipsin. Ayrıntılar için KVKK Aydınlatma Metni sayfasına bakabilir, taleplerini İletişim sayfasındaki adrese iletebilirsin.",
        ],
      },
    ],
  },

  terms: {
    slug: "terms",
    title: "Kullanım Koşulları",
    lead:
      "CineSeat'i kullanarak aşağıdaki koşulları kabul etmiş sayılırsın.",
    sections: [
      {
        heading: "Hesabın",
        body: [
          "Hesabını oluştururken verdiğin bilgilerin doğru olmasından sen sorumlusun. Hesap bilgilerini başkasıyla paylaşmaman, şifreni gizli tutman gerekir. Hesabın üzerinden yapılan işlemler senin sorumluluğundadır.",
        ],
      },
      {
        heading: "Bilet işlemleri",
        body: [
          "Bir bilet satın aldığında, seçtiğin seans ve koltuk için bir rezervasyon oluşturulur. Seans saati geçtikten sonra bilet kullanılamaz hale gelir.",
        ],
      },
      {
        heading: "Kabul edilmeyen kullanım",
        list: [
          "Siteyi otomatik araçlarla aşırı yük bindirecek şekilde kullanmak",
          "Başka kullanıcıların hesaplarına erişmeye çalışmak",
          "Koltuk kilitleme mekanizmasını kötüye kullanarak salonları bloke etmek",
          "Sitedeki içeriği izinsiz olarak çoğaltmak veya ticari amaçla kullanmak",
        ],
      },
      {
        heading: "Hizmetin sürekliliği",
        body: [
          "Bakım, güncelleme veya teknik sorunlar nedeniyle hizmet geçici olarak kesintiye uğrayabilir. Bu tür kesintilerden doğabilecek dolaylı zararlardan sorumlu değiliz.",
        ],
      },
      {
        heading: "Koşullardaki değişiklikler",
        body: [
          "Bu koşullar zaman zaman güncellenebilir. Güncel sürüm her zaman bu sayfada yayımlanır.",
        ],
      },
    ],
  },

  kvkk: {
    slug: "kvkk",
    title: "KVKK Aydınlatma Metni",
    lead:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme.",
    sections: [
      {
        heading: "Veri sorumlusu",
        body: [
          "Kişisel verilerin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) uyarınca veri sorumlusu sıfatıyla CineSeat tarafından aşağıda açıklanan kapsamda işlenmektedir.",
        ],
      },
      {
        heading: "İşlenen veriler ve amaçları",
        list: [
          "Kimlik ve iletişim verileri (ad, soyad, e-posta, telefon) — üyelik kaydının oluşturulması ve iletişim",
          "İşlem güvenliği verileri (oturum bilgisi) — hesabının güvenliğinin sağlanması",
          "Müşteri işlem verileri (rezervasyon, koltuk, tutar) — bilet satışının gerçekleştirilmesi ve kayıt altına alınması",
        ],
      },
      {
        heading: "Hukuki sebep",
        body: [
          "Verilerin, sözleşmenin kurulması ve ifası için gerekli olması ile veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi hukuki sebeplerine dayanılarak işlenmektedir.",
        ],
      },
      {
        heading: "KVKK madde 11 kapsamındaki hakların",
        list: [
          "Kişisel verilerinin işlenip işlenmediğini öğrenme",
          "İşlenmişse buna ilişkin bilgi talep etme",
          "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
          "Eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme",
          "Kanundaki şartlar çerçevesinde silinmesini veya yok edilmesini isteme",
          "İşlemenin münhasıran otomatik sistemlerle analiz edilmesi suretiyle aleyhine bir sonuç ortaya çıkmasına itiraz etme",
        ],
      },
      {
        heading: "Başvuru",
        body: [
          "Yukarıdaki haklarına ilişkin taleplerini İletişim sayfasında yer alan e-posta adresine iletebilirsin. Başvurular en geç otuz gün içinde sonuçlandırılır.",
        ],
      },
    ],
  },

  refund: {
    slug: "refund",
    title: "İptal ve İade",
    lead: "Biletini hangi koşullarda iptal edebileceğini burada bulabilirsin.",
    sections: [
      {
        heading: "İptal süresi",
        body: [
          "Biletler, seans başlangıç saatinden en geç bir saat öncesine kadar iptal edilebilir. Seans saatine bir saatten az kalan biletler iptal edilemez.",
        ],
      },
      {
        heading: "İade süreci",
        body: [
          "İptal edilen biletin bedeli, ödemenin yapıldığı karta iade edilir. Bankaya bağlı olarak iadenin hesabına yansıması 3–10 iş günü sürebilir.",
        ],
      },
      {
        heading: "Kısmi iptal",
        body: [
          "Aynı rezervasyonda birden fazla koltuk varsa, koltukların tamamı birlikte iptal edilir; tek tek koltuk iptali yapılamaz.",
        ],
      },
      {
        heading: "Seansın iptal edilmesi",
        body: [
          "Seans sinema tarafından iptal edilirse, bilet bedelinin tamamı herhangi bir işlem yapmana gerek kalmadan iade edilir ve durum sana e-posta ile bildirilir.",
        ],
      },
      {
        heading: "Demo notu",
        body: [
          "Bu projede ödeme akışı simülasyondur; gerçek bir tahsilat yapılmadığı için gerçek bir iade işlemi de gerçekleşmez.",
        ],
      },
    ],
  },
};

export default staticPages;
