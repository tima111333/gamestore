'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/Skeleton'

/**
 * The gallery only matters once the user scrolls to it, so it is code-split and
 * client-only. The skeleton reserves the exact box to keep CLS at zero.
 */
const Gallery = dynamic(() => import('@/components/game/Gallery').then((mod) => mod.Gallery), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-3">
      <Skeleton className="notch aspect-video w-full" />
      <div className="grid grid-cols-6 gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="aspect-video w-full" />
        ))}
      </div>
    </div>
  ),
})

export function GalleryLoader(props: { shots: string[]; title: string }) {
  return <Gallery {...props} />
}
