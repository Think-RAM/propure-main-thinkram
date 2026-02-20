import { Shield, Coins, Rocket } from 'lucide-react'
import { BentoGrid, BentoCell, BentoTitle, BentoDesc } from './BentoGrid'

export default function UserAttraction() {
  return (
    <section className="py-20 px-10 bg-white">
      <div className="flex justify-center mb-10">
        <h2 className="display-text text-5xl">LOWER RISK. HIGHER RETURNS.</h2>
      </div>

      <BentoGrid cols={3}>
        <BentoCell>
          <Shield className="text-primary mb-5" size={32} />
          <BentoTitle>Risk Mitigation</BentoTitle>
          <BentoDesc>
            <span className="text-primary">Advanced risk assessment</span> models identify potential issues before they impact your investment
          </BentoDesc>
        </BentoCell>

        <BentoCell>
          <Coins className="text-primary mb-5" size={32} />
          <BentoTitle>Positive Cash Flow</BentoTitle>
          <BentoDesc>
            Identify properties with strong rental yields that generate consistent income
          </BentoDesc>
        </BentoCell>

        <BentoCell>
          <Rocket className="text-primary mb-5" size={32} />
          <BentoTitle>Growth Potential</BentoTitle>
          <BentoDesc>
            AI predictions identify suburbs with above-average capital growth opportunities
          </BentoDesc>
        </BentoCell>
      </BentoGrid>
    </section>
  )
}
