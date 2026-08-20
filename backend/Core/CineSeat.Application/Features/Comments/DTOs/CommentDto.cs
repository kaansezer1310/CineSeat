namespace CineSeat.Application.Features.Comments.DTOs;

public class CommentDto
{
    public long Id { get; set; }
    public long MovieId { get; set; }
    public long UserId { get; set; }

    /// <summary>Yorumu yazanın kullanıcı adı — e-posta gibi kimlik bilgisi sızdırılmaz.</summary>
    public string Username { get; set; } = string.Empty;

    public short Rating { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsEdited { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
