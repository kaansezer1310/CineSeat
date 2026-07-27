namespace  CineSeat.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string PasswordSalt { get; set; }
        public bool IsAdmin { get; set; }

        // Navigation Properties
        public virtual ICollection<Comment> Comments { get; set; }
        public virtual ICollection<UserFavorites> UserFavorites { get; set; }

        public User()
        {
            Comments = new HashSet<Comment>();
            UserFavorites = new HashSet<UserFavorites>();
        }
    }
}