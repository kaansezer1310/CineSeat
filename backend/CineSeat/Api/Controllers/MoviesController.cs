using CineSeat.Application.Common.Models;
using CineSeat.Application.Features.Movies.Commands.CreateMovie;
using CineSeat.Application.Features.Movies.Queries.GetMovies;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.Api.Controllers
{
    /// <summary>
    /// Controller'ın tek sorumluluğu: HTTP'yi Command/Query'ye çevirmek ve
    /// sonucu HTTP durum koduna dönüştürmek.
    ///
    /// Burada ne DbContext var, ne iş kuralı, ne doğrulama.
    /// Bir endpoint eklemek = bir Command/Query göndermek.
    /// </summary>
    [Route("api/movies")]
    public class MoviesController : BaseApiController
    {
        /// <summary>Yeni film oluşturur.</summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create(
            [FromBody] CreateMovieCommand command,
            CancellationToken cancellationToken)
        {
            Result<long> result = await Sender.Send(command, cancellationToken);

            if (!result.IsSuccess)
            {
                return Conflict(new { error = result.Error });
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Value }, new { id = result.Value });
        }

        /// <summary>Filmleri arama ve sayfalama ile listeler.</summary>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<MovieDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(
            [FromQuery] GetMoviesQuery query,
            CancellationToken cancellationToken)
        {
            var result = await Sender.Send(query, cancellationToken);
            return Ok(result.Value);
        }

        /// <summary>
        /// Tek film getirir. Şu an GetMovies sorgusunu id ile filtreleyerek çalışır;
        /// gerçek projede kendi GetMovieByIdQuery'si olur — sunum kapsamında
        /// bilinçli olarak yazılmadı.
        /// </summary>
        [HttpGet("{id:long}")]
        [ProducesResponseType(typeof(MovieDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetMoviesQuery(Page: 1, PageSize: 100), cancellationToken);
            var movie = result.Value?.Items.FirstOrDefault(m => m.Id == id);

            return movie is null ? NotFound() : Ok(movie);
        }
    }
}
