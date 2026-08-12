using CineSeat.Application;
using CineSeat.Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add Application Layer Services
builder.Services.AddApplicationServices();

// Add Persistence Layer Services
builder.Services.AddPersistenceServices(builder.Configuration);

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();