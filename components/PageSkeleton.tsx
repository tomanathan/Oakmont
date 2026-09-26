// Placeholder page bodies for loading.tsx screens: shown the instant a link
// is clicked, in roughly the shape of the page that's coming, so the click
// visibly lands and nothing jumps when the real content arrives.

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[#efe8d8] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Block className="mb-2 h-9 w-72" />
      <Block className="mb-6 h-4 w-40" />
      <Block className="mb-6 h-40 w-full" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Block key={i} className="h-28" />
        ))}
      </div>
    </div>
  );
}

export function LessonSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="grid gap-6 lg:grid-cols-[220px_1fr_260px]">
      <div className="hidden flex-col gap-2 lg:flex">
        {Array.from({ length: 6 }, (_, i) => (
          <Block key={i} className="h-8" />
        ))}
      </div>
      <div>
        <Block className="mb-3 h-8 w-2/3" />
        <Block className="mb-6 h-4 w-1/2" />
        <Block className="mb-4 h-48 w-full" />
        <Block className="h-72 w-full" />
      </div>
      <div className="hidden lg:block">
        <Block className="h-64" />
      </div>
    </div>
  );
}

export function StackSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Block className="mb-2 h-9 w-64" />
      <Block className="mb-8 h-4 w-80 max-w-full" />
      <div className="flex flex-col gap-4">
        <Block className="h-40" />
        <Block className="h-56" />
        <Block className="h-32" />
      </div>
    </div>
  );
}

// For pages without the app header (plans, onboarding, parent pages).
export function BarePageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading" className="mx-auto max-w-[760px] px-6 py-12">
      <Block className="mx-auto mb-4 h-14 w-14 rounded-full" />
      <Block className="mx-auto mb-3 h-8 w-64" />
      <Block className="mx-auto mb-10 h-4 w-80 max-w-full" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Block className="h-56" />
        <Block className="h-56" />
      </div>
    </div>
  );
}
