import apiClient from "./apiClient.js";

/**
 * Backend'in sayfa başına verdiği azami kayıt sayısı. Sunucu tarafındaki
 * `InclusiveBetween(1, 100)` doğrulamasıyla birebir aynı olmalı; büyük bir
 * değer istenirse istek 400 ile döner.
 */
export const MAX_PAGE_SIZE = 100;

// Bozuk bir cevabın döngüyü sonsuza sürüklemesini engelleyen üst sınır.
const MAX_PAGES = 50;

function buildQuery(params) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query;
}

/**
 * Bir listeleme ucunun TAMAMINI çeker ve düz dizi döndürür.
 *
 * Açılır listeler ve yönetim tabloları eksiksiz veri bekliyor, backend ise
 * sayfa başına en fazla MAX_PAGE_SIZE kayıt veriyor. Çağıran kendi sayfasını
 * belirtmediyse sayfalar burada tek tek dolaşılıp birleştirilir; böylece
 * 100'ü aşan kayıt sessizce kırpılmaz.
 *
 * Hem createAdminResource hem de kendi yolunu kuran servisler (örn. sinemaya
 * göre seanslar) bunu kullanıyor ki sunucudaki sayfa sınırı tek yerden
 * takip edilsin.
 */
export async function fetchAllPages(basePath, params = {}) {
  const query = buildQuery(params);

  const request = () => {
    const suffix = query.toString() ? `?${query}` : "";
    return apiClient.get(`${basePath}${suffix}`);
  };

  // Çağıran belirli bir sayfa istediyse ona karışılmaz.
  if (query.has("pageNumber") || query.has("pageSize")) {
    const result = await request();
    return Array.isArray(result) ? result : (result?.items ?? []);
  }

  const collected = [];
  query.set("pageSize", String(MAX_PAGE_SIZE));

  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber += 1) {
    query.set("pageNumber", String(pageNumber));

    const result = await request();

    // Sayfalamayan uçlar düz dizi döner; tek turda biter.
    if (Array.isArray(result)) {
      return result;
    }

    const items = result?.items ?? [];
    collected.push(...items);

    const totalPages = Number(result?.totalPages) || 0;

    // Son sayfaya gelindiyse ya da sayfa boş döndüyse dur. Boşluk kontrolü,
    // totalPages tutarsız gelse bile döngünün kapanmasını garanti eder.
    if (pageNumber >= totalPages || items.length === 0) {
      break;
    }
  }

  return collected;
}

/**
 * Tek biçimli CRUD uçları için servis üreteci.
 *
 * Yönetim uçlarının hepsi aynı deseni izliyor:
 *   GET    /api/<yol>            → liste (bazıları sayfalı, bazıları düz dizi)
 *   POST   /api/<yol>            → oluştur
 *   PUT    /api/<yol>/{id}       → güncelle
 *   DELETE /api/<yol>/{id}       → arşivle (backend soft-delete yapar)
 *
 * Yedi ayrı ekran için aynı dört fonksiyonu elle yazmak yerine tek yerde
 * tanımlanıyor. Sayfalı/düz dizi farkı burada soğuruluyor: çağıran her zaman
 * düz bir dizi alır.
 *
 * @param basePath  "/cities" gibi, başında eğik çizgiyle
 * @param mapDto    DTO'yu arayüz şekline çeviren fonksiyon
 * @param toCommand form verisini backend komutuna çeviren fonksiyon
 */
export function createAdminResource({
  basePath,
  mapDto = (dto) => dto,
  toCommand = (values) => values,
}) {
  return {
    /**
     * Kaynağın tamamını düz dizi olarak döndürür.
     *
     * Açılır listeler ve yönetim tabloları eksiksiz veri bekliyor, backend ise
     * sayfa başına en fazla MAX_PAGE_SIZE kayıt veriyor. Bu yüzden çağıran
     * kendi sayfasını belirtmediyse sayfalar burada tek tek dolaşılıp
     * birleştirilir.
     */
    async list(params = {}) {
      return (await fetchAllPages(basePath, params)).map(mapDto);
    },

    async create(values) {
      return apiClient.post(basePath, toCommand(values));
    },

    async update(id, values) {
      // Backend komutları Id'yi gövdede de bekliyor (rota parametresiyle
      // birlikte doğrulanıyor).
      return apiClient.put(`${basePath}/${id}`, {
        id: Number(id),
        ...toCommand(values),
      });
    },

    async remove(id) {
      return apiClient.del(`${basePath}/${id}`);
    },
  };
}
