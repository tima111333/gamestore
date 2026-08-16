import { Container } from '@/components/ui/Section'
import { GameGridSkeleton, Skeleton } from '@/components/ui/Skeleton'

export default function CatalogLoading() {
  return (
    <Container className="pb-24 pt-28 lg:pt-36">
      <div className="mb-10 flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-16 w-[min(100%,32rem)]" />
        <Skeleton className="h-4 w-[min(100%,28rem)]" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:gap-12">
        <div className="hidden flex-col gap-4 lg:flex">
          <Skeleton className="h-8 w-32" />
          {Array.from({ length: 10 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-12 w-full" />
          <GameGridSkeleton />
        </div>
      </div>
    </Container>
  )
}
