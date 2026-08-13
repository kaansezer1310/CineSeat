using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CineSeat.Api.Controllers
{
    /// <summary>
    /// Tüm controller'ların ortak atası. Tek işi MediatR'ın <see cref="ISender"/>
    /// örneğini sağlamak — böylece her controller'da ayrı constructor yazılmaz.
    /// </summary>
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        private ISender? _sender;

        protected ISender Sender =>
            _sender ??= HttpContext.RequestServices.GetRequiredService<ISender>();
    }
}
