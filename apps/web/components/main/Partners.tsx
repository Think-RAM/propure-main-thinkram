export default function Partners() {
  const partners = [
    'CoreLogic',
    'Domain',
    'REA Group',
    'Australian Bureau of Statistics',
    'Reserve Bank of Australia',
    'PropTrack',
    'PriceFinder',
    'Infrastructure Australia',
  ]

  return (
    <section className="overflow-hidden py-10 border-b border-grid-20 bg-paper">
      <div className="flex animate-scroll whitespace-nowrap">
        {[...partners, ...partners].map((partner, index) => (
          <div
            key={index}
            className="flex-shrink-0 px-10 font-mono text-sm font-bold text-grid-30 uppercase"
          >
            {partner}
          </div>
        ))}
      </div>
    </section>
  )
}
