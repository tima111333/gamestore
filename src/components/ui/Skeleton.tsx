import { cn } from '@/lib/utils'

/**
 * Layout-accurate placeholder. Skeletons reserve the exact box the real content
 * will occupy, which is what keeps CLS near zero during streaming.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('relative overflow-hidden bg-surface-2', className)}
      aria-hidden="true"
    >
      <div className="skeleton-sheen absolute inset-0" />
    </div>
  )
}

export function GameCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="notch aspect-[3/4] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  )
}

export function GameGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <GameCardSkeleton key={index} />
      ))}
    </div>
  )
}
