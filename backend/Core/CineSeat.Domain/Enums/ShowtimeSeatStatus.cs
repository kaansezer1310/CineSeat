namespace CineSeat.Domain.Enums
{
    /// <summary>
    /// Bir koltugun BELIRLI BIR SEANS icindeki durumu. Seat.IsActive salonun
    /// kalici ozelligidir; bu ise seansa gore degisir.
    /// </summary>
    public enum ShowtimeSeatStatus
    {
        Available = 1,
        Locked = 2,
        Reserved = 3
    }
}
