import { describe, it, expect } from 'vitest'
import { isVideoUrl, getMediaType } from '@/lib/media'

describe('isVideoUrl', () => {
  it('returns true for .mp4 URLs', () => {
    expect(isVideoUrl('https://example.com/video.mp4')).toBe(true)
  })

  it('returns true for .mov URLs', () => {
    expect(isVideoUrl('https://example.com/clip.mov')).toBe(true)
  })

  it('returns true for .webm URLs', () => {
    expect(isVideoUrl('https://example.com/clip.webm')).toBe(true)
  })

  it('returns true for .avi URLs', () => {
    expect(isVideoUrl('https://example.com/clip.avi')).toBe(true)
  })

  it('returns true for .mkv URLs', () => {
    expect(isVideoUrl('https://example.com/clip.mkv')).toBe(true)
  })

  it('returns false for .jpg URLs', () => {
    expect(isVideoUrl('https://example.com/photo.jpg')).toBe(false)
  })

  it('returns false for .png URLs', () => {
    expect(isVideoUrl('https://example.com/photo.png')).toBe(false)
  })

  it('returns false for URLs without extension', () => {
    expect(isVideoUrl('https://example.com/photo')).toBe(false)
  })

  it('handles URLs with query parameters', () => {
    expect(isVideoUrl('https://example.com/video.mp4?w=720&q=80')).toBe(true)
    expect(isVideoUrl('https://example.com/photo.jpg?v=2')).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(isVideoUrl('https://example.com/Video.MP4')).toBe(true)
    expect(isVideoUrl('https://example.com/CLIP.MOV')).toBe(true)
    expect(isVideoUrl('https://example.com/Photo.JPG')).toBe(false)
  })

  it('returns false for invalid URLs', () => {
    expect(isVideoUrl('')).toBe(false)
    expect(isVideoUrl('not-a-url')).toBe(false)
  })
})

describe('getMediaType', () => {
  it('returns "video" for video URLs', () => {
    expect(getMediaType('https://example.com/video.mp4')).toBe('video')
    expect(getMediaType('https://example.com/clip.mov')).toBe('video')
  })

  it('returns "image" for image URLs', () => {
    expect(getMediaType('https://example.com/photo.jpg')).toBe('image')
    expect(getMediaType('https://example.com/photo.png')).toBe('image')
  })
})
