import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function FlashcardCollectionLoading() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <Skeleton className="h-6 w-6" />
        <div className="flex-1">
          <Skeleton className="h-6 w-40" />
        </div>
        <Skeleton className="h-10 w-24" />
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>

        {/* Deck Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-48" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />

                <div className="flex items-center gap-2 text-xs">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-32" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between text-xs">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-5 w-16" />
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-20" />
                </div>

                <Skeleton className="h-3 w-32 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
