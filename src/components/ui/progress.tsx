import { cn } from '@/lib/utils'

type ProgressProps = {
  value: number
  className?: string
}

export function Progress({ value, className }: ProgressProps) {
  const normalizedValue = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-800', className)}>
      <div
        className="h-full bg-violet-500 transition-all"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  )
}
