import { put } from "@vercel/blob";

/**
 * Upload a Buffer to Vercel Blob and return { url, key }.
 *
 * Requires the read/write token that Vercel created for your project:
 * - BLOB_READ_WRITE_TOKEN  (created automatically when you connected the store with prefix BLOB)
 *
 * You can scope keys by setting BLOB_KEY_PREFIX in env (e.g. "development/", "staging/", "production/").
 */
export async function uploadBufferToBlob(key: string, buffer: Buffer, contentType: string) {
  const prefix = (process.env.BLOB_KEY_PREFIX || "").replace(/^\/+|\/+$/g, "");
  const path = prefix ? `${prefix}/${key}` : key;

  // put() example from Vercel: put('path/to/file.txt', data, { access: 'public' })
  // @vercel/blob will pick up the token from process.env.BLOB_READ_WRITE_TOKEN
  const { url } = await put(path, buffer, {
    access: "public", // public so frontend can load directly. Use 'private' and signed URLs if you want private objects
    contentType,
  });

  return { url, key: path };
}