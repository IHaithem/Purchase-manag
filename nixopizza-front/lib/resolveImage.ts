export const resolveImage = (url?: string) =>
  !url ? "" : url.startsWith("http") ? url : process.env.NEXT_PUBLIC_BASE_URL + url;