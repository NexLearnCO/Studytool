import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
        <Skeleton className="h-6 w-6" />
        <div className="flex-1">
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* AI Insights Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="space-y-6">
          <div className="grid w-full grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>

          {/* Learning Data Flow */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-5 w-48" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center space-y-3">
                    <Skeleton className="h-16 w-16 mx-auto rounded-2xl" />
                    <div>
                      <Skeleton className="h-8 w-12 mx-auto mb-1" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-20 mx-auto" />
                      <Skeleton className="h-3 w-24 mx-auto" />
                      <Skeleton className="h-3 w-18 mx-auto" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                <Skeleton className="h-4 w-32 mx-auto mb-4" />
                <div className="flex items-center justify-center gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-16" />
                      {i < 6 && <Skeleton className="h-4 w-4" />}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-5 w-48" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="text-center p-3 rounded-lg">
                      <Skeleton className="h-6 w-12 mx-auto mb-1" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <Skeleton className="h-4 w-32" />
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
