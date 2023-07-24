using Microsoft.EntityFrameworkCore;

namespace TGparseApi.Models
{
  public class TGMessagesDbContext: DbContext
  {

    public TGMessagesDbContext(DbContextOptions<TGMessagesDbContext> options) : base(options)
    {
      Database.EnsureCreated();
    }

    public DbSet<TGMessage> TGMessages { get; set; } = null!;
  }
}
