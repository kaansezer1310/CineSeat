import {
  cinemaResource,
  cityResource,
  districtResource,
} from "./locationService.js";

// Sinema kayıtları şehir/ilçe ile birlikte veritabanından gelir. Şehir adı
// sinema DTO'sunda taşınmadığı için ilçe → şehir eşlemesi burada kurulur;
// böylece sayfa üç ayrı ucu birleştirme işini yapmaz.
//
// Sayfalama ve alan eşlemesi kaynakların kendi içinde hallediliyor; burada
// elle sorgu dizesi kurulmuyor ki sunucu tarafındaki sayfa sınırı tek bir
// yerden takip edilsin.
async function getCinemas() {
  const [cinemas, districts, cities] = await Promise.all([
    cinemaResource.list(),
    districtResource.list(),
    cityResource.list(),
  ]);

  const cityNameById = new Map(cities.map((city) => [city.id, city.name]));

  const cityNameByDistrictId = new Map(
    districts.map((district) => [
      district.id,
      cityNameById.get(district.cityId) ?? "",
    ])
  );

  return cinemas.map((cinema) => ({
    id: cinema.id,
    name: cinema.name,
    address: cinema.address,
    city: cityNameByDistrictId.get(cinema.districtId) ?? "",
    lat: cinema.latitude,
    lng: cinema.longitude,
  }));
}

const cinemaService = {
  getCinemas,
};

export default cinemaService;
