using System.Drawing;

namespace TGparseApi
{
  public static class Utilities
  {
    public static bool Base64StringSaveToImgPng(string rawBase64String, string fileName)
    {
      if (rawBase64String.Contains("base64"))
      {
        string defaultImagePath = "C:\\IMAGES";
        string base64String = rawBase64String.Substring(rawBase64String.IndexOf(",") + 1);
        byte[] byteBuffer = Convert.FromBase64String(base64String);
        using (MemoryStream ms = new MemoryStream(byteBuffer))
        {
          Image image = Image.FromStream(ms);

          image.Save($"{defaultImagePath}\\{fileName}.png");
        }
        return true;

        //File.WriteAllBytes(defaultImagePath + "\\file.png", byteBuffer); short
      }

      return false;
    }
  }
}
