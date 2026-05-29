import { flatten } from "../../data/utils";

interface Content {
  allURLs: Map<string, string[]>;
  allPosts: Map<string, string>;
  singleImage: boolean;
  empty: boolean;
}

class ContentLookup {
  private static instance: ContentLookup;

  private lookup: Map<string, Content>;

  private constructor() {
    this.lookup = new Map<string, Content>();
  }

  public delete(key: string) {
    this.lookup.delete(key);
  }

  public hasURLs(key: string) {
    return (this.lookup.get(key)?.allURLs?.size ?? 0) > 0;
  }

  public isEmpty(key: string) {
    const content = this.lookup.get(key);
    return content?.empty ?? true;
  }

  public isSingleImage(key: string) {
    const content = this.lookup.get(key);
    return content?.singleImage ?? true;
  }

  public setSingleImage(key: string) {
    const content = this.lookup.get(key);
    if (content == null) {
      return;
    }

    const values = flatten(Array.from(content.allURLs.values()));
    content.singleImage = values.length === 1;
  }

  public initContent(key: string) {
    this.lookup.set(key, {
      allURLs: new Map<string, string[]>(),
      allPosts: new Map<string, string>(),
      singleImage: false,
      empty: true,
    });
  }

  public addURLs(key: string, newURLs: Map<string, string[]>) {
    const content = this.lookup.get(key);
    if (content == null) {
      return;
    }

    newURLs.forEach((value, key) => {
      const urls = content.allURLs.get(key);
      if (urls == null) {
        content.allURLs.set(key, value);
      } else {
        urls.push(...value);
      }
    });

    if (content.empty) {
      content.empty = Array.from(newURLs.values()).every(
        (value) => value.length === 0,
      );
    }
  }

  public addPosts(key: string, newPosts?: Map<string, string>) {
    const content = this.lookup.get(key);
    if (content == null) {
      return;
    }

    newPosts?.forEach((value, key) => content.allPosts.set(key, value));
  }

  public getPost(key: string, urlKey: string) {
    return this.lookup.get(key)?.allPosts?.get(urlKey);
  }

  public getURLKeys(key: string) {
    const content = this.lookup.get(key);
    return content != null ? Array.from(content.allURLs.keys()) : [];
  }

  public getURLValues(key: string, urlKey: string) {
    return this.lookup.get(key)?.allURLs?.get(urlKey) ?? [];
  }

  public getAllURLValues(key: string) {
    const content = this.lookup.get(key);
    if (content == null) {
      return [];
    }

    return Array.from(content.allURLs.values());
  }

  public static getInstance(): ContentLookup {
    if (ContentLookup.instance == null) {
      ContentLookup.instance = new ContentLookup();
    }

    return ContentLookup.instance;
  }
}

export default function content() {
  return ContentLookup.getInstance();
}
