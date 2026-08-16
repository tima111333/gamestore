/**
 * Background footage. Free-licence clips from Pexels, referenced directly from
 * their CDN — nothing is bundled, and each one has a poster frame that renders
 * instantly while (or instead of) the video loads.
 */
export interface BackgroundClip {
  src: string
  poster: string
  credit: string
  creditUrl: string
}

export const HERO_CLIP: BackgroundClip = {
  src: 'https://videos.pexels.com/video-files/11164611/11164611-hd_1920_1080_25fps.mp4',
  poster:
    'https://images.pexels.com/videos/11164611/pexels-photo-11164611.jpeg?auto=compress&cs=tinysrgb&w=1920',
  credit: 'Pexels',
  creditUrl: 'https://www.pexels.com/video/colorful-lights-against-black-background-11164611/',
}

export const GENRES_CLIP: BackgroundClip = {
  src: 'https://videos.pexels.com/video-files/34247736/14512574_640_360_30fps.mp4',
  poster:
    'https://images.pexels.com/videos/34247736/pexels-photo-34247736.jpeg?auto=compress&cs=tinysrgb&w=1600',
  credit: 'Pexels',
  creditUrl: 'https://www.pexels.com/video/dynamic-abstract-neon-light-pattern-in-motion-34247736/',
}
