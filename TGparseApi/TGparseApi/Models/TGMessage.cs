using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TGparseApi.Models
{
  public class TGMessage
  {
    public Guid Id { get; set; }

    public string MId { get; set; }

    public string PeerId { get; set; }

    public string Timestamp { get; set; }

    public string MessageRichHTML { get; set; }

    public string MediaPhotoPaths { get; set; }
  }
}
