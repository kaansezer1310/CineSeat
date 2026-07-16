# # CineSeat

CineSeat, kullanıcıların filmleri inceleyebildiği, seans seçebildiği, koltuk rezervasyonu oluşturabildiği ve rezervasyon özetini görüntüleyebildiği bir sinema bileti rezervasyon uygulamasıdır.

Proje, React tabanlı frontend geliştirme, component yapısı, durum yönetimi ve veri erişim katmanı konularında pratik yapmak amacıyla geliştirilmiştir.

> CineSeat şu anda frontend prototipi aşamasındadır. Film, seans ve rezervasyon işlemleri mock veriler ve localStorage kullanılarak simüle edilmektedir.

## Özellikler

- Filmleri listeleme

- Film detaylarını görüntüleme

- Filme ait seansları listeleme

- Dinamik koltuk planı

- Dolu ve müsait koltukların gösterilmesi

- Birden fazla koltuk seçimi

- Seçilen biletleri sepete ekleme

- Aynı seansa ait koltukları sepette birleştirme

- Rezervasyon oluşturma

- Rezervasyon sonucunu görüntüleme

- Yüklenme ve hata durumlarının yönetimi

- Erişilebilir koltuk ve durum bildirimleri

## Kullanılan Teknolojiler

- React

- Vite

- JavaScript

- React Router

- TanStack Query

- Context API

- useReducer

- useState

- Vitest

- React Testing Library

- CSS

- localStorage

## Uygulama Yapısı

Uygulamadaki durumlar kullanım amaçlarına göre ayrılmıştır:

- Koltuk seçimi gibi sayfaya özel durumlar `useState` ile yönetilir.

- Sepet durumu Context API ve `useReducer` ile global olarak yönetilir.

- Film, seans ve dolu koltuk verileri TanStack Query ile alınır ve önbelleğe alınır.

- Veri işlemleri component'ler yerine servis katmanı üzerinden gerçekleştirilir.

- Rezerve koltuklar ve rezervasyon geçmişi localStorage içerisinde saklanır.

Provider sıralaması:

```text

StrictMode

└── QueryClientProvider

    └── BrowserRouter

        └── CartProvider

            └── App