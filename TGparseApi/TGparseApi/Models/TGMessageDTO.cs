using System.ComponentModel.DataAnnotations;

namespace TGparseApi.Models
{
  public class TGMessageDTO
  {
    [Required]
    public string MId { get; set; }

    public string PeerId { get; set; }

    public string Timestamp { get; set; }

    public string MessageRichHTML { get; set; }

    public string[] MediaPhotos { get; set; }
  }
}
