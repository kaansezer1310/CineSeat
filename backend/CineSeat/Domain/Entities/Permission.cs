using System.Collections.Generic;
using CineSeat.Domain.Common;

namespace CineSeat.Domain.Entities
{
    public class Permission : BaseEntity
    {
        public string Name { get; set; }
        public string Description { get; set; }

        public ICollection<RolePermission> RolePermissions { get; set; }
    }
}
