using Microsoft.AspNetCore.Mvc;
using TGparseApi.Models;

namespace TGparseApi.Controllers
{
  [ApiController]
  [Route("api/tgmessages")]
  public class TGParseController : Controller
  {
    private readonly ITGMessageRepository _context;

    public TGParseController(ITGMessageRepository context)
    {
      _context = context;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<string>> CreateTGMessages(TGMessageDTO[] messagesDTO)
    {
      if (ModelState.IsValid)
      {
        foreach (TGMessageDTO messageDTO in messagesDTO)
        {
          var tGMessage = new TGMessage
          {
            MId = messageDTO.MId,
            PeerId = messageDTO.PeerId,
            Timestamp = messageDTO.Timestamp,
            MessageRichHTML = messageDTO.MessageRichHTML,
            MediaPhotoPaths = messageDTO.MediaPhotos.Length > 0 ? GetSavePaths(messageDTO.MediaPhotos) : "empty",
          };

          _context.Create(tGMessage);
        }

        return "Done";
      }
      else
      {
        return BadRequest();
      }
    }

    [HttpGet]
    public async Task<ActionResult<TGMessage>> GetById(Guid id)
    {
      return _context.Get(id);
    }

    private string GetSavePaths(string[] rawBase64MediaPhotos)
    {
      string[] paths = new string[rawBase64MediaPhotos.Length];
      for (int i = 0; i < rawBase64MediaPhotos.Length; i++)
      {
        string imageName = Guid.NewGuid().ToString();
        if (Utilities.Base64StringSaveToImgPng(rawBase64MediaPhotos[i], imageName))
        {
          paths[i] = imageName;
        }
        else
        {
          paths[i] = "";
        }
      }
      string result = string.Join(";", paths.Where(path => path.Length > 0));

      return result.Length > 0 ? result : "empty";
    }
  }
}
