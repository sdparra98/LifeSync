export const searchBookCover = async (title: string, author: string): Promise<string | null> => {
  try {
    const q = [
      title ? `intitle:${title}` : '',
      author ? `inauthor:${author}` : ''
    ].filter(Boolean).join('+');

    if (!q) return null;
    
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=1`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.items && data.items.length > 0 && data.items[0].volumeInfo.imageLinks) {
      const links = data.items[0].volumeInfo.imageLinks;
      // Prefer thumbnail, replace http with https to avoid mixed content warnings
      const url = links.thumbnail || links.smallThumbnail;
      return url ? url.replace('http://', 'https://') : null;
    }
    return null;
  } catch (e) {
    console.error("Error fetching book cover:", e);
    return null;
  }
};