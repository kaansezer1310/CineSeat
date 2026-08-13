using System.Collections.Generic;
using CineSeat.Domain.Common;
using CineSeat.Domain.Enums;

namespace CineSeat.Domain.Entities
{
    public class Campaign : BaseEntity
    {
        public string Name { get; set; }
        public CampaignType Type { get; set; }
        public decimal Value { get; set; }
        public decimal MinCartTotal { get; set; }
        public bool MembersOnly { get; set; }
        public bool IsActive { get; set; }

        public ICollection<Reservation> Reservations { get; set; }
    }
}
