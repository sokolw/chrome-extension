using Microsoft.EntityFrameworkCore;
using System.Text;
using TGparseApi.Models;

namespace TGparseApi
{
  public class Program
  {
    public static void Main(string[] args)
    {
      var builder = WebApplication.CreateBuilder(args);

      var dbConnectionConfiguration = builder.Configuration.GetConnectionString("tgparse-mssql");

      // Add services to the container.

      builder.Services.AddControllers();
      builder.Services.AddTransient<ITGMessageRepository, TGMessageRepository>(provider => new TGMessageRepository(dbConnectionConfiguration));
      //builder.Services.AddDbContext<TGMessagesDbContext>(opt =>
      //    opt.UseNpgsql(dbConnectionConfiguration));
      // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
      builder.Services.AddEndpointsApiExplorer();
      builder.Services.AddSwaggerGen(c =>
      {
        c.SwaggerDoc("v1", new() { Title = "TGparseApi", Version = "v1" });
      });

      var app = builder.Build();

      // Configure the HTTP request pipeline.
      if (app.Environment.IsDevelopment())
      {
        app.UseSwagger(c =>
        {
          c.RouteTemplate = "api/docs/{documentname}/swagger.json";
        });
        app.UseSwaggerUI(c =>
        {
          c.SwaggerEndpoint("/api/docs/v1/swagger.json", "TGparseApi v1");
          c.RoutePrefix = "api/docs";
        });
      }

      app.UseHttpsRedirection();

      //app.UseAuthorization();

      app.MapControllers();

      app.Run();
    }
  }
}