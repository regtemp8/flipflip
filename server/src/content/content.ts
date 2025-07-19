class ContentService {
  private static instance: ContentService

  private readonly loaders: Map<string, ContentLoader>

  private constructor() {
    this.loaders = new Map()
  }

  public static getInstance(): ContentService {
    if (ContentService.instance == null) {
      ContentService.instance = new ContentService()
    }

    return ContentService.instance
  }

  public void startLoading(displayId: number) {

  }

  public void stopLoading(displayId: number) {
    
  }
}

export default function content() {
  return ContentService.getInstance()
}