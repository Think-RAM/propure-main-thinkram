import { BentoGrid, BentoCell, BentoLabel, BentoDesc } from './BentoGrid'

export default function InvestorLogs() {
  const testimonials = [
    {
      name: 'Sarah Chen',
      color: 'teal' as const,
      quote:
        'Propure helped me identify a property in Brisbane that has already appreciated 15% in just 6 months.',
    },
    {
      name: 'Michael Rodriguez',
      color: 'mint' as const,
      quote:
        "The risk assessment saved me from a bad investment. Propure's multi-agent analysis is thorough.",
    },
    {
      name: 'Dr. Emily Watson',
      color: 'gold' as const,
      quote:
        "As a busy professional, I don't have time for manual research. Propure does it all.",
    },
  ]

  return (
    <section className="py-20 px-10 border-b border-grid-20">
      <div className="flex items-baseline gap-5 mb-10">
        <h2 className="display-text text-5xl">INVESTOR LOGS</h2>
      </div>

      <BentoGrid cols={3}>
        {testimonials.map((testimonial, index) => (
          <BentoCell key={index}>
            <BentoLabel color={testimonial.color}>{testimonial.name}</BentoLabel>
            <BentoDesc>&ldquo;{testimonial.quote}&rdquo;</BentoDesc>
            <div className="mt-auto text-gold text-[10px]">★★★★★</div>
          </BentoCell>
        ))}
      </BentoGrid>
    </section>
  )
}
