using CineSeat.Domain.Entities.Common;

namespace CineSeat.Domain.Entities
{
    public class RolePermission : BaseEntity
    {
        public long RoleId { get; set; }
        public Role Role { get; set; } = null!;

        public long PermissionId { get; set; }
        public Permission Permission { get; set; } = null!;
    }
}
