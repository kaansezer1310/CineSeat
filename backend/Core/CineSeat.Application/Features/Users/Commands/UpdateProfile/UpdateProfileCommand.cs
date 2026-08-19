using MediatR;

namespace CineSeat.Application.Features.Users.Commands.UpdateProfile;

/// <summary>
/// Kullanıcının kendi profilini güncellemesi. Email/Username/Role BİLİNÇLİ
/// OLARAK yok: kimlik alanlarının değişmesi ayrı bir akış (doğrulama gerektirir),
/// rol değişimi ise yetki yükseltme demektir.
/// </summary>
public class UpdateProfileCommand : IRequest<Unit>
{
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string? PhoneNum { get; set; }
    public string? Gender { get; set; }
}
