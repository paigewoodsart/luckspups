// Photo rows store the full public URL from Supabase Storage's
// getPublicUrl(), not the bare bucket-relative key .remove() needs -- this
// strips everything up through the bucket-name marker to recover it.
export function storageKeyFromUrl(url: string): string | null {
  const marker = "/animal-photos/";
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}
