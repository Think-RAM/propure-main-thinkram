import { cn } from '@/lib/utils'

interface BentoGridProps {
  children: React.ReactNode
  cols?: 2 | 3
  className?: string
}

export function BentoGrid({ children, cols = 2, className }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid gap-[1px] bg-grid-20 border border-grid-20',
        cols === 2 && 'grid-cols-1 lg:grid-cols-2',
        cols === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoCellProps {
  children: React.ReactNode
  className?: string
}

export function BentoCell({ children, className }: BentoCellProps) {
  return (
    <div
      className={cn(
        'bg-paper p-8 flex flex-col justify-between min-h-[250px]',
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoLabelProps {
  children: React.ReactNode
  color?: 'teal' | 'mint' | 'gold' | 'coral'
}

export function BentoLabel({ children, color = 'teal' }: BentoLabelProps) {
  const colorMap = {
    teal: 'border-primary text-primary',
    mint: 'border-mint text-mint',
    gold: 'border-gold text-gold',
    coral: 'border-coral text-coral',
  }

  return (
    <div className={cn('mono-label pl-3 border-l-[3px] mb-5', colorMap[color])}>
      {children}
    </div>
  )
}

export function BentoTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-head text-2xl font-semibold text-secondary mb-3">
      {children}
    </h3>
  )
}

export function BentoDesc({ children }: { children: React.ReactNode }) {
  return <p className="font-body text-grid mb-4 text-sm">{children}</p>
}
