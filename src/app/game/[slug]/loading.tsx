import { Container } from '@/components/ui/Section'
import { Skeleton } from '@/components/ui/Skeleton'

export default function GameLoading() {
  return (
    <div>
      <div className="relative min-h-[60svh] pt-28 lg:min-h-[70svh]">
        <Skeleton className="absolute inset-0" />
        <Container className="relative flex min-h-[inherit] flex-col justify-end pb-10">
          <Skeleton className="mb-6 h-3 w-40" />
          <Skeleton className="h-20 w-[min(100%,48rem)]" />
          <Skeleton className="mt-5 h-5 w-[min(100%,32rem)]" />
          <Skeleton className="mt-8 h-6 w-64" />
        </Container>
      </div>

      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div className="flex flex-col gap-10">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="notch aspect-video w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <Skeleton className="notch h-96 w-full" />
      </Container>
    </div>
  )
}
