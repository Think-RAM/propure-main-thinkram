import { Check } from 'lucide-react'
import { BentoGrid, BentoCell, BentoLabel, BentoDesc } from './BentoGrid'

export default function DataTrust() {
  const dataSources = [
    'Govt Census Data',
    'Sales Records',
    'Rental Histories',
    'Zoning Maps',
    'Infra Approvals',
    'Demographics',
  ]

  const metricDefinitions = [
    {
      term: 'Rental Yield',
      definition: 'Annual rent divided by property price, expressed as a %.',
    },
    {
      term: 'Capital Growth',
      definition: 'Predicted annualized price growth based on market signals.',
    },
    {
      term: 'Vacancy Rate',
      definition: 'Expected vacancy risk derived from market data.',
    },
    {
      term: 'Momentum Score',
      definition: 'Composite signal of recent price momentum.',
    },
  ]

  return (
    <section className="py-20 px-10 border-b border-grid-20">
      <BentoGrid cols={2}>
        <BentoCell>
          <BentoLabel color="teal">Data Trust & Sources</BentoLabel>
          <BentoDesc>
            We surface data from authoritative sources and present clear definitions.
          </BentoDesc>
          <ul className="font-mono text-xs grid grid-cols-2 gap-2.5 mt-4">
            {dataSources.map((source) => (
              <li key={source} className="flex items-center gap-2">
                <Check className="text-primary" size={14} />
                {source}
              </li>
            ))}
          </ul>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="mint">Metric Definitions</BentoLabel>
          <ul className="font-body text-sm flex flex-col gap-4 mt-4">
            {metricDefinitions.map((item) => (
              <li key={item.term}>
                <strong className="text-secondary">{item.term}:</strong>{' '}
                {item.definition}
              </li>
            ))}
          </ul>
        </BentoCell>
      </BentoGrid>
    </section>
  )
}
