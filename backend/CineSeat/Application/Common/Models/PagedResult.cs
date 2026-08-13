namespace CineSeat.Application.Common.Models
{
    /// <summary>
    /// Sayfalanmış liste sonucu. Query handler'ları ham liste yerine bunu döndürür,
    /// böylece istemci toplam kayıt sayısını da öğrenir.
    /// </summary>
    public class PagedResult<T>
    {
        public PagedResult(IReadOnlyList<T> items, int totalCount, int page, int pageSize)
        {
            Items = items;
            TotalCount = totalCount;
            Page = page;
            PageSize = pageSize;
        }

        public IReadOnlyList<T> Items { get; }
        public int TotalCount { get; }
        public int Page { get; }
        public int PageSize { get; }
        public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
    }
}
