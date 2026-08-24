import apiClient from "./apiClient.js";

// Sinema kayıtları şehir/ilçe ile birlikte veritabanından gelir. Şehir adı
// sinema DTO'sunda taşınmadığı için ilçe → şehir eşlemesi burada kurulur;
// böylece sayfa üç ayrı ucu birleştirme işini yapmaz.
async function getCinemas() {
  const [cinemaResult, districtResult, cityResult] = await Promise.all([
    apiClient.get("/cinemas?pageNumber=1&pageSize=200"),
    apiClient.get("/districts?pageNumber=1&pageSize=500"),
    apiClient.get("/cities?pageNumber=1&pageSize=200"),
  ]);

  const cityNameById = new Map(
    (cityResult?.items ?? cityResult ?? []).map((city) => [
      city.id,
      city.cityName,
    ])
  );

  const cityNameByDistrictId = new Map(
    (districtResult?.items ?? districtResult ?? []).map((district) => [
      district.id,
      cityNameById.get(district.cityId) ?? "",
    ])
  );

  return (cinemaResult?.items ?? cinemaResult ?? []).map((cinema) => ({
    id: cinema.id,
    name: cinema.name,
    address: cinema.address,
    city: cityNameByDistrictId.get(cinema.districtId) ?? "",
    lat: Number(cinema.latitude),
    lng: Number(cinema.longitude),
  }));
}

const cinemaService = {
  getCinemas,
};

export default cinemaService;
