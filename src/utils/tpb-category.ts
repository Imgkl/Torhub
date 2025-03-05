import { Icon } from "@raycast/api";

export const TPBCategory = {
  All: 0,
  AllAudio: 100,
  AllVideo: 200,
  AllApplication: 300,
  AllGames: 400,
  AllPorn: 500,
  AllOther: 600,

  Audio: {
    Music: 101,
    Audiobooks: 102,
    Soundclips: 103,
    FLAC: 104,
    Other: 199,
  },

  Video: {
    Movies: 201,
    MoviesDVDR: 202,
    Musicvideos: 203,
    Movieclips: 204,
    TVshows: 205,
    Handheld: 206,
    HDMovies: 207,
    HDTVshows: 208,
    Movies3D: 209,
    Other: 299,
  },

  Applications: {
    Windows: 301,
    Mac: 302,
    UNIX: 303,
    Handheld: 304,
    IOS: 305,
    Android: 306,
    OtherOS: 399,
  },

  Games: {
    PC: 401,
    Mac: 402,
    PSx: 403,
    XBOX360: 404,
    Wii: 405,
    Handheld: 406,
    IOS: 407,
    Android: 408,
    Other: 499,
  },

  Porn: {
    Movies: 501,
    MoviesDVDR: 502,
    Pictures: 503,
    Games: 504,
    HDMovies: 505,
    Movieclips: 506,
    Other: 599,
  },

  Other: {
    Ebooks: 601,
    Comics: 602,
    Pictures: 603,
    Covers: 604,
    Physibles: 605,
    OtherOther: 699,
  },
};

function getCategoryNameFromId(categoryId: number): string {
  // Audio categories (100-199)
  if (categoryId >= 100 && categoryId < 200) {
    switch (categoryId) {
      case TPBCategory.Audio.Music:
        return "Music";
      case TPBCategory.Audio.Audiobooks:
        return "Audio Books";
      case TPBCategory.Audio.Soundclips:
        return "Sound Clips";
      case TPBCategory.Audio.FLAC:
        return "FLAC";
      case TPBCategory.Audio.Other:
        return "Other Audio";
      default:
        return "Audio";
    }
  }
  // Video categories (200-299)
  else if (categoryId >= 200 && categoryId < 300) {
    switch (categoryId) {
      case TPBCategory.Video.Movies:
        return "Movies";
      case TPBCategory.Video.MoviesDVDR:
        return "Movies DVDR";
      case TPBCategory.Video.Musicvideos:
        return "Music Videos";
      case TPBCategory.Video.Movieclips:
        return "Movie Clips";
      case TPBCategory.Video.TVshows:
        return "TV Shows";
      case TPBCategory.Video.Handheld:
        return "Handheld";
      case TPBCategory.Video.HDMovies:
        return "HD Movies";
      case TPBCategory.Video.HDTVshows:
        return "HD TV Shows";
      case TPBCategory.Video.Movies3D:
        return "3D Movies";
      case TPBCategory.Video.Other:
        return "Other Video";
      default:
        return "Video";
    }
  }
  // Applications (300-399)
  else if (categoryId >= 300 && categoryId < 400) {
    switch (categoryId) {
      case TPBCategory.Applications.Windows:
        return "Windows Apps";
      case TPBCategory.Applications.Mac:
        return "Mac Apps";
      case TPBCategory.Applications.UNIX:
        return "UNIX Apps";
      case TPBCategory.Applications.Handheld:
        return "Handheld Apps";
      case TPBCategory.Applications.IOS:
        return "iOS Apps";
      case TPBCategory.Applications.Android:
        return "Android Apps";
      case TPBCategory.Applications.OtherOS:
        return "Other OS Apps";
      default:
        return "Applications";
    }
  }
  // Games (400-499)
  else if (categoryId >= 400 && categoryId < 500) {
    switch (categoryId) {
      case TPBCategory.Games.PC:
        return "PC Games";
      case TPBCategory.Games.Mac:
        return "Mac Games";
      case TPBCategory.Games.PSx:
        return "PSx Games";
      case TPBCategory.Games.XBOX360:
        return "XBOX Games";
      case TPBCategory.Games.Wii:
        return "Wii Games";
      case TPBCategory.Games.Handheld:
        return "Handheld Games";
      case TPBCategory.Games.IOS:
        return "iOS Games";
      case TPBCategory.Games.Android:
        return "Android Games";
      case TPBCategory.Games.Other:
        return "Other Games";
      default:
        return "Games";
    }
  }
  // Porn (500-599)
  else if (categoryId >= 500 && categoryId < 600) {
    return "Adult Content";
  }
  // Other (600-699)
  else if (categoryId >= 600 && categoryId < 700) {
    switch (categoryId) {
      case TPBCategory.Other.Ebooks:
        return "E-books";
      case TPBCategory.Other.Comics:
        return "Comics";
      case TPBCategory.Other.Pictures:
        return "Pictures";
      case TPBCategory.Other.Covers:
        return "Covers";
      case TPBCategory.Other.Physibles:
        return "Physibles";
      case TPBCategory.Other.OtherOther:
        return "Other";
      default:
        return "Other";
    }
  }

  return "Unknown";
}

// function to get icon and text based on category id
function getCategoryIconAndTextFromId(category: string): { icon: string; text: string } {
  switch (category) {
    case "Music":
    case "Audio":
    case "Audio Books":
    case "Sound Clips":
    case "FLAC":
    case "Other Audio":
      return { icon: Icon.Music, text: category };

    case "Movies":
    case "Movies DVDR":
    case "Music Videos":
    case "Movie Clips":
    case "HD Movies":
    case "Other Video":
      return { icon: Icon.FilmStrip, text: category };

    case "3D Movies":
      return { icon: Icon.Glasses, text: category };

    case "Handheld":
      return { icon: Icon.Camera, text: category };

    case "HD TV Shows":
    case "TV Shows":
      return { icon: Icon.Monitor, text: category };

    case "Mac Apps":
      return { icon: Icon.Finder, text: category };

    case "iOS Apps":
    case "Android Apps":
      return { icon: Icon.Mobile, text: category };

    case "Windows Apps":
    case "UNIX Apps":
    case "Handheld Apps":
    case "Other OS Apps":
      return { icon: Icon.Code, text: category };

    case "Adult Content":
      return { icon: Icon.ExclamationMark, text: category };

    case "E-books":
    case "Comics":
      return { icon: Icon.Book, text: category };

    case "Pictures":
    case "Covers":
      return { icon: Icon.Image, text: category };

    case "Physibles":
    case "Other":
      return { icon: Icon.Document, text: category };

    default:
      return { icon: Icon.QuestionMark, text: "Unknown" };
  }
}

export { getCategoryIconAndTextFromId, getCategoryNameFromId };
