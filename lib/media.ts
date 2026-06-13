const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v', '.wmv', '.flv', '.3gp', '.ogv']

export function isVideoUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase()
    return VIDEO_EXTENSIONS.some(ext => path.endsWith(ext))
  } catch {
    return false
  }
}

export function getMediaType(url: string): 'video' | 'image' {
  return isVideoUrl(url) ? 'video' : 'image'
}
