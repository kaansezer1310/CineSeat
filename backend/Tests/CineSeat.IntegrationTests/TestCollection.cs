namespace CineSeat.IntegrationTests;

/// <summary>
/// Tüm entegrasyon testleri tek bir uygulama örneğini ve tek bir test
/// veritabanını paylaşır. Aynı koleksiyondaki sınıflar xUnit tarafından
/// sırayla çalıştırılır; paralel koşsalardı aynı veritabanı üzerinde
/// birbirlerinin verisini bozarlardı.
/// </summary>
[CollectionDefinition(Name)]
public class TestCollection : ICollectionFixture<CineSeatApiFactory>
{
    public const string Name = "CineSeat entegrasyon";
}
