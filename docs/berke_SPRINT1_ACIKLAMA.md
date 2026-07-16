# Sprint 1 — Ne Yaptım? (Mentöre Anlatım İçin)

**Görev:** 1.3.1 — Ana sayfada "Vizyonda" ve "Yakında" sekmeleri
**Proje:** CineSeat (sinema bilet uygulaması, React)
**Branch:** `berke`

Bu dosya, bu sprintte yazdığım kodu **basit dille** anlatıyor: hangi dosyaya dokundum, o dosya ne işe yarıyor, neden öyle yazdım. Amaç, mentörüme "şunu yaptım, şöyle çalışıyor" diyebilmek.

---

## 1. Özellik ne yapıyor? (kullanıcı gözünden)

Ana sayfada artık iki sekme var:

- **Vizyonda** → şu anda sinemalarda gösterimde olan filmler (varsayılan açılan sekme).
- **Yakında** → henüz vizyona girmemiş, ileri bir tarihte gösterime girecek filmler. Bu filmlerin kartında "Seansları Gör" yerine **vizyon tarihi** ve **"Vizyona kaç gün kaldı"** yazıyor.

Sekmeye tıklayınca sayfa yenilenmiyor, film listesi anında değişiyor.

---

## 2. Kod nerede, ne yapıyor? (dosya dosya)

Kodu 4 katmana yaydım. Her katmanın tek bir görevi var — bu yüzden bir şey değiştirmem gerektiğinde nereye bakacağımı biliyorum.

### 2.1 `src/data/movies.js` — Ham veri

Burası sadece filmlerin listesi (gerçek bir veritabanı olmadığı için mock/sahte veri). Her filme yeni bir alan ekledim:

```js
{
  id: 5,
  title: "Kayıp Sinyal",
  ...
  releaseDate: "2026-08-14",   // ← yeni eklenen alan: vizyon tarihi
}
```

`releaseDate` olmayan/geçmiş bir filmi "vizyonda", gelecekteki bir filmi "yakında" sayacağız. Yakında sekmesi boş görünmesin diye 2 tane yeni ("henüz vizyona girmemiş") film ekledim; bu filmlerin poster resmi yok çünkü elimde poster dosyası yoktu — o zaten var olan "poster bulunamadı" görünümüyle otomatik hallediliyor (aşağıda 2.4'te).

### 2.2 `src/services/movieService.js` — İş mantığı (business logic)

Burası "bir film vizyonda mı, değil mi, kaç gün kaldı" hesabını yapan yer. 3 yeni fonksiyon ekledim:

```js
isMovieReleased(movie, referenceDate = new Date())
// releaseDate bugün veya geçmişse true (film vizyonda) döner

getDaysUntilRelease(movie, referenceDate = new Date())
// vizyona kaç gün kaldığını sayı olarak döner

parseIsoDateOnly(isoDateString)
// "2026-08-14" gibi bir metni gerçek bir Date nesnesine çevirir
```

**Bunlar "saf fonksiyon" (pure function):** aynı girdiyi verirsen her zaman aynı çıktıyı alırsın, ekrana bir şey yazmazlar, hiçbir şeyi değiştirmezler. Bu yüzden test yazmak çok kolay oldu (aşağıda 4'te göstereceğim).

**Neden bu dosyaya ekledim, `HomePage.jsx`'e değil?** Çünkü bu hesaba hem `HomePage.jsx` (hangi sekmede hangi film görünecek) hem de `MovieCard.jsx` (kart üstünde ne yazacak) ihtiyaç duyuyor. Aynı hesabı iki yere kopyalamak yerine tek bir yerde yazıp ikisinin de oradan çağırmasını sağladım.

**Küçük ama önemli bir detay — saat dilimi hatası:** `"2026-08-14"` gibi bir tarih metnini direkt `new Date("2026-08-14")` ile çevirirsen, JavaScript bunu **UTC** (dünya saati) olarak yorumluyor. Kullanıcının bilgisayarı farklı bir saat diliminde ise, gösterilen tarih bir gün kayabiliyor. Onun yerine `parseIsoDateOnly` tarihi yıl/ay/gün olarak parçalayıp **kullanıcının kendi yerel saatinde** bir tarih kuruyor. Bunu geliştirirken fark edip düzelttim (kod incelemesinde de bir bulgu olarak not düştüm).

### 2.3 `src/pages/HomePage.jsx` — Sayfa (sekmeler burada)

Burası kullanıcının gördüğü ana sayfa. Yaptığım değişiklik:

```jsx
const [activeTab, setActiveTab] = useState("nowShowing");

const nowShowingMovies = movies.filter((movie) => movieService.isMovieReleased(movie));
const comingSoonMovies = movies.filter((movie) => !movieService.isMovieReleased(movie));

const visibleMovies = activeTab === "nowShowing" ? nowShowingMovies : comingSoonMovies;
```

`useState` React'te "bu bileşenin hatırladığı bir değer" demek — kullanıcı hangi sekmede olduğunu burada tutuyoruz. Sekmeye tıklayınca sadece bu değer değişiyor, **yeni bir ağ isteği atılmıyor** (filmler zaten sayfa açılırken bir kere çekiliyor); bu yüzden geçiş anında oluyor.

### 2.4 `src/components/movies/MovieCard.jsx` — Film kartı

Her film kartının içeriğini burası çiziyor. Tek değişiklik, kartın alt kısmında (footer):

```jsx
{isUpcoming ? (
  <>
    <span>13 Ağustos 2026</span>
    <strong>Vizyona 29 gün kaldı</strong>
  </>
) : (
  <>
    <span>2026</span>
    <strong>Seansları Gör</strong>
  </>
)}
```

**Önemli tercih:** Bu kart için **hiçbir yeni CSS eklemedim** — hem "vizyonda" hem "yakında" durumu, zaten var olan `.movie-card-footer` görünümünü kullanıyor, sadece içindeki yazı değişiyor. Posteri olmayan filmler için de zaten var olan "poster bulunamadı" tasarımı otomatik devreye giriyor (`MoviePoster.jsx` dosyasında önceden yazılmış bir kod, ben dokunmadım). Amaç: var olan tasarımı bozmadan, sadece üstüne yeni içerik koymak.

### 2.5 `src/App.css` — Sekme butonlarının görünümü

Sekme (tab) butonu daha önce projede hiç yoktu, o yüzden burada birkaç yeni CSS kuralı eklemek zorunda kaldım (yoksa buton çirkin/biçimsiz görünürdü). Ama bunu **dosyanın en sonuna ekleme olarak** yaptım — var olan hiçbir kuralı değiştirmedim, sadece yeni kurallar ekledim. Renkler de projede zaten tanımlı olan değişkenleri kullanıyor (`var(--color-yellow)` gibi), yeni bir renk icat etmedim.

---

## 3. Parçalar birbirine nasıl bağlanıyor?

```
movies.js (veri: releaseDate alanı)
      │
      ▼
movieService.js (hesap: vizyonda mı? kaç gün kaldı?)
      │                              │
      ▼                              ▼
HomePage.jsx                   MovieCard.jsx
(hangi film hangi sekmede)     (kartta ne yazacak)
      │
      ▼
App.css (sekme butonları nasıl görünecek)
```

---

## 4. Test ettiğimin kanıtı

Sadece "çalışıyor gibi" demek yerine, gerçekten çalıştığını gösteren komutları çalıştırdım. Sonuçlar:

**Testler** (`npm run test:run`):
```
Test Files  7 passed (7)
     Tests  24 passed (24)
```
Bunun 10 tanesi doğrudan benim bu sprintte yazdığım testler:

- `src/services/movieService.test.js` (7 test) — tarih hesabının sınır durumlarını kontrol ediyor: tam bugünse ne olur, geçmişse ne olur, gelecekse ne olur, tarih hiç yoksa ne olur.
- `src/pages/HomePage.test.jsx` (3 test) — sekmeye tıklayınca doğru filmlerin geldiğini, kalan gün sayısının doğru yazıldığını, sekme değişince **tekrar ağ isteği atılmadığını**, ve bir sekmede hiç film yoksa uygun bir mesaj çıktığını kontrol ediyor.

**Lint** (`npm run lint`): hata yok.

**Build** (`npm run build`): production derlemesi başarılı (`✓ built in 366ms`).

---

## 5. Kod incelemesinde (code review) ne buldum?

Kendi yazdığım kodu, bittikten sonra ayrıca eleştirel gözle tekrar okudum. Bulduklarım:

1. **Bir tekrar sorunuydu, düzelttim:** `MovieCard.jsx`'te aynı görünümü iki kere yazmıştım (biri "vizyonda", biri "yakında" için) — tek bir görünüme indirip içini duruma göre değiştirdim.
2. **Bilerek düzeltmediğim bir nokta var:** Şu an filmler elle yazdığım sabit veri, ama ileride bir admin panelinden film eklenirse, biri tarihi yanlış formatta girerse kod hata verebilir. Şimdilik bunu düzeltmedim çünkü henüz o admin formu yok (o ayrı bir görev) — ama not olarak bıraktım ki o görev yapılırken hatırlansın.
3. **Kapsam dışı bıraktığım bir şey:** "Yakında" bir filmin detay sayfasına girilirse, orada henüz vizyon tarihi gösterilmiyor (sadece "seans yok" yazıyor). Bu benim görevimin dosya listesinde yoktu, bilerek ileriki bir sprinte bıraktım.

---

## 6. React'e özel kavramlar (mentörden gelebilecek teknik sorular için)

Mentör kodun içinden bir satır gösterip "bu ne, hook mu, state mi, prop mu?" diye sorabilir. Aşağıda **gerçekten yazdığım koddan** alınmış örneklerle bu kavramları tek tek açıklıyorum.

### 6.1 Component (Bileşen)

```jsx
function HomePage() { ... }
function MovieCard({ movie, onSelect }) { ... }
```

React'te ekrana bir şey çizen her fonksiyona **component (bileşen)** denir. Kuralı basit: adı büyük harfle başlar (`HomePage`, `MovieCard`) ve JSX (HTML'e benzeyen kod) döndürür. `HomePage` bir **sayfa** bileşeni, `MovieCard` ise sayfanın içinde tekrar tekrar kullanılan (her film için bir tane) küçük bir bileşen.

### 6.2 Hook — "use" ile başlayan özel fonksiyonlar

```jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
```

**Hook**, adı `use` ile başlayan ve bir component'in **en üst seviyesinde** (if/for'un içinde değil) çağrılan özel fonksiyonlardır. Bu sprintte 3 farklı hook kullandım, üçü de farklı bir kütüphaneden:

| Hook | Nereden geliyor | Ne işe yarıyor |
|---|---|---|
| `useState` | React'in kendisi | component'in **hatırladığı** bir değer (state) yaratır |
| `useQuery` | React Query kütüphanesi | ağdan veri çekmeyi, yüklenme/hata durumunu yönetir |
| `useNavigate` | React Router kütüphanesi | başka bir sayfaya yönlendirme fonksiyonu verir |

Yani "hook" tek bir şey değil, bir **kategori**. `useState` hook'u state yönetir ama her hook state yönetmez (`useNavigate` hiç state tutmuyor, sadece bir fonksiyon veriyor).

### 6.3 State — "bileşenin hatırladığı, değişince ekranı yeniden çizen değer"

```jsx
const [activeTab, setActiveTab] = useState("nowShowing");
```

Bu satırda **iki şey** var:
- `activeTab` → **state'in kendisi**, şu anki değer ("nowShowing" ya da "comingSoon").
- `setActiveTab` → bu değeri **değiştirmek için kullanılan fonksiyon**.

`useState("nowShowing")` çağrısı, başlangıç değeri "nowShowing" olan bir state kutusu açar. Önemli nokta: `setActiveTab(...)` çağrıldığında React otomatik olarak `HomePage`'i **yeniden çizer (re-render)** — activeTab değişince ekranda görünen film listesinin de değişmesinin sebebi bu.

### 6.4 "Bu state mi?" tuzağı — hesaplanan (derived) değerler

Kodda state olmayan ama state'e benzeyen satırlar da var, bunlar mentörün sorabileceği en sinsi soru olabilir:

```jsx
// HomePage.jsx içinde:
const nowShowingMovies = movies.filter((movie) => {
  return movieService.isMovieReleased(movie);
});

// MovieCard.jsx içinde:
const isUpcoming = !movieService.isMovieReleased(movie);
```

Bunlar **state DEĞİL**, hook da değil. Sadece sıradan bir `const` — her render'da (her yeniden çizimde) yeniden hesaplanan **türetilmiş (derived) bir değer**. `useState` kullanmadım çünkü bu değerlerin "hatırlanmasına" gerek yok; zaten elimde olan `movies` listesinden ve `movie` objesinden **anında yeniden hesaplanabiliyor**. Gereksiz yere her şeyi state yapmak, kodun senkron kalmasını (iki değerin birbirini tutmasını) zorlaştırırdı — bu yüzden "state'e gerçekten ihtiyaç var mı, yoksa var olan veriden hesaplanabilir mi?" sorusunu kendime sordum.

### 6.5 Props — bileşene dışarıdan verilen veri

```jsx
function MovieCard({ movie, onSelect }) { ... }
```

```jsx
<MovieList
  movies={visibleMovies}
  onMovieSelect={handleMovieSelect}
/>
```

**Props**, bir üst (parent) bileşenin, alt (child) bileşene "dışarıdan" geçirdiği verilerdir — fonksiyona parametre geçmek gibi düşünülebilir. `HomePage`, `MovieList`'e `movies` ve `onMovieSelect` prop'larını veriyor; `MovieList` de bunları sırayla her `MovieCard`'a `movie` ve `onSelect` olarak geçiriyor. **Tek yönlü akış**: veri hep yukarıdan aşağıya akar, bir child kendi props'unu değiştiremez (sadece parent'tan gelen bir fonksiyonu — örn. `onSelect` — çağırarak parent'a "bir şey oldu" haber verebilir).

### 6.6 Event handler — tıklama gibi olaylara cevap veren fonksiyonlar

```jsx
function handleCardClick() {
  onSelect(movie.id);
}
...
<button onClick={handleCardClick}>
```

```jsx
<button onClick={() => setActiveTab(tab.id)}>
```

İkisi de "tıklanınca çalışacak fonksiyon" ama iki farklı yazım var:
- `handleCardClick` gibi **isimli bir fonksiyon tanımlayıp** `onClick={handleCardClick}` ile bağlamak (parametre gerekmiyorsa).
- `onClick={() => setActiveTab(tab.id)}` gibi **anlık (inline) bir ok fonksiyonu (arrow function)** yazmak — bunu kullandım çünkü `setActiveTab`'a `tab.id` diye bir **parametre** geçmem gerekiyordu; `onClick={setActiveTab}` yazsaydım, React tıklama anında kendi olay (event) nesnesini `tab.id` yerine gönderirdi, bu da yanlış olurdu.

### 6.7 Koşullu render (conditional rendering)

```jsx
{isUpcoming ? (
  <>...vizyon tarihi + kalan gün...</>
) : (
  <>...releaseYear + "Seansları Gör"...</>
)}
```

JSX içinde `if/else` yazamayız, onun yerine JavaScript'in **ternary operatörü** (`koşul ? doğruysa : yanlışsa`) kullanılır. Burada `<>...</>` gördüğün şey **Fragment** — birden fazla elementi (span + strong) tek bir kapsayıcı `<div>` eklemeden bir arada döndürmenin yolu (gereksiz bir HTML etiketi eklemek istemedim).

### 6.8 `key` prop — React'in listede "hangisi hangisi" takibi

```jsx
{MOVIE_TABS.map((tab) => {
  return (
    <button key={tab.id} ...>
```

Bir listeyi (`.map` ile) ekrana çizerken React'e her elemanın **benzersiz bir kimliği** olduğunu söylemek gerekir — `key` bunun için var. React bu sayede bir sonraki render'da "hangi eleman aynı kaldı, hangisi değişti/silindi" ayrımını yapabiliyor. `key` bir prop gibi görünür ama component'in içine **geçmez** (yani `MovieCard`'ın kendisi kendi `key`'ini göremez) — sadece React'in kendi iç takibi için kullanılır.

### 6.9 Ne zaman yeniden çizim (re-render) olur?

Özetle bu component'ler şu iki durumda yeniden çizilir:
1. **State değişince** (`setActiveTab(...)` çağrıldığında `HomePage` yeniden çizilir).
2. **Props değişince** (`HomePage` yeniden çizilince, `visibleMovies` değeri değiştiği için `MovieList`'e ve dolayısıyla `MovieCard`'lara yeni props gider, onlar da yeniden çizilir).

`isUpcoming`, `nowShowingMovies` gibi türetilmiş değerler ayrıca bir tetikleyici değil — onlar zaten her render'da otomatik yeniden hesaplanıyor, çünkü state veya props değiştiğinde tüm fonksiyon (component) baştan çalışıyor.

---

## Mentöre sorabileceğim olası sorular

- "Neden tarih hesaplama fonksiyonlarını ayrı bir dosyaya (`movieService.js`) koydun, `HomePage.jsx`'in içine yazmadın?" → Cevap 2.2'de.
- "Pure function ne demek, neden önemli?" → Cevap 2.2'de.
- "Sekmeye tıklayınca neden sayfa yenilenmiyor/internet isteği gitmiyor?" → Cevap 2.3'te.
- "Saat dilimi (timezone) hatasını nasıl fark ettin?" → Cevap 2.2'nin son paragrafında.
- "`useState` ile `const nowShowingMovies = movies.filter(...)` arasındaki fark ne, ikisi de state mi?" → Cevap 6.3 ve 6.4'te (hayır, ikincisi state değil).
- "Hook ne demek, her hook state mi tutar?" → Cevap 6.2'de (hayır — `useNavigate` state tutmuyor).
- "`onClick={handleCardClick}` ile `onClick={() => setActiveTab(tab.id)}` arasında neden farklı yazdın?" → Cevap 6.6'da.
- "Bu `key={tab.id}` neden var, prop olarak component'in içine geçiyor mu?" → Cevap 6.8'de (hayır, sadece React'in kendi takibi için).
- "`<>...</>` bu ne?" → Cevap 6.7'de (Fragment).
