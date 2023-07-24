using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace TGparseApi.Models
{
  public interface ITGMessageRepository
  {
    void Create(TGMessage tgMessage);
    void Delete(Guid id);
    TGMessage Get(Guid id);
    List<TGMessage> GetTGMessages();
    void Update(TGMessage tgMessage);
  }

  public class TGMessageRepository : ITGMessageRepository
  {
    private string _connectionString = null;

    public TGMessageRepository(string connectionString)
    {
      _connectionString = connectionString;
    }

    public List<TGMessage> GetTGMessages()
    {
      using (IDbConnection db = new SqlConnection(_connectionString))
      {
        return db.Query<TGMessage>("SELECT * FROM TGMessages").ToList();
      }
    }

    public TGMessage Get(Guid id)
    {
      using (IDbConnection db = new SqlConnection(_connectionString))
      {
        return db.Query<TGMessage>("SELECT * FROM TGMessages WHERE Id = @id", new { id }).FirstOrDefault();
      }
    }

    public void Create(TGMessage tgMessage)
    {
      using (IDbConnection db = new SqlConnection(_connectionString))
      {
        var sqlQuery = "INSERT INTO TGMessages (Id, MId, PeerId, Timestamp, MessageRichHTML, MediaPhotoPaths) " +
          "VALUES(DEFAULT, @MId, @PeerId, @Timestamp, @MessageRichHTML, @MediaPhotoPaths)";
        db.Execute(sqlQuery, tgMessage);

        // если мы хотим получить id добавленного пользователя
        //var sqlQuery = "INSERT INTO Users (Name, Age) VALUES(@Name, @Age); SELECT CAST(SCOPE_IDENTITY() as int)";
        //int? userId = db.Query<int>(sqlQuery, user).FirstOrDefault();
        //user.Id = userId.Value;
      }
    }

    public void Update(TGMessage tgMessage)
    {
      using (IDbConnection db = new SqlConnection(_connectionString))
      {
        var sqlQuery = "UPDATE TGMessages SET MId = @MId, PeerId = @PeerId, " +
          "Timestamp = @Timestamp, MessageRichHTML = @MessageRichHTML, MediaPhotoPaths = @MediaPhotoPaths WHERE Id = @Id";
        db.Execute(sqlQuery, tgMessage);
      }
    }

    public void Delete(Guid id)
    {
      using (IDbConnection db = new SqlConnection(_connectionString))
      {
        var sqlQuery = "DELETE FROM TGMessages WHERE Id = @id";
        db.Execute(sqlQuery, new { id });
      }
    }
  }
}
