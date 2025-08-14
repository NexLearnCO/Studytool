import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PracticeLoading() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <Skeleton className="h-6 w-6" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-10 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Parameters */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-20" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Topics */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Configuration */}
          <Card>
            <CardHeader className="pb-4">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Skeleton className="h-4 w-48" />
                <div className="px-2">
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between mt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="h-3 w-3" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg border-2">
                <Skeleton className="h-5 w-32 mx-auto mb-2" />
                <Skeleton className="h-3 w-full" />
              </div>

              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
