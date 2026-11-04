import urls from '../../scripts/photo-urls.json'

export const optionPhotoFiles: Record<string, string> = urls

export function localPhotoPath(optionId: string): string {
  return `/quiz/refs/${optionId}.jpg`
}
