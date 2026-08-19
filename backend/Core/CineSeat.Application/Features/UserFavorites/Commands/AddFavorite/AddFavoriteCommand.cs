using MediatR;

namespace CineSeat.Application.Features.UserFavorites.Commands.AddFavorite;

/// <summary>
/// UserId BİLİNÇLİ OLARAK YOK — istekle gelseydi herkes başkasının favori
/// listesini değiştirebilirdi. Kullanıcı ICurrentUserService'ten okunur.
/// </summary>
public class AddFavoriteCommand : IRequest<long>
{
    public long MovieId { get; set; }
}
