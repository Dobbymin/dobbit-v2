export const cleanContent = (content: string) => {
  const regex = /\[블록미디어\s+.*?\s*기자\]/;
  const match = content.match(regex);

  if (match) {
    const matchIndex = content.indexOf(match[0]);
    const contentAfterTag = content.slice(matchIndex + match[0].length);
    return contentAfterTag.trim();
  }

  return content;
};
