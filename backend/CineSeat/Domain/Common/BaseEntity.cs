using System;

namespace CineSeat.Domain.Common
{
    public abstract class BaseEntity
    {
        public long Id { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
    }
}
