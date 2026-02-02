import { BentoGrid, BentoCell, BentoLabel, BentoTitle, BentoDesc } from './BentoGrid'

export default function TrustedData() {
  return (
    <section className="py-20 px-10 border-b border-grid-20">
      <div className="flex items-baseline gap-5 mb-10">
        <h2 className="display-text text-5xl">TRUSTED DATA</h2>
        <span className="mono-label opacity-50">PROVEN METRICS</span>
      </div>

      <BentoGrid cols={2}>
        <BentoCell>
          <BentoLabel color="teal">Markets Analyzed</BentoLabel>
          <h3 className="font-head text-5xl font-semibold text-primary">15,000+</h3>
          <BentoDesc>
            Comprehensive analysis of Australian property markets with real-time data
          </BentoDesc>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="mint">Transactions</BentoLabel>
          <h3 className="font-head text-5xl font-semibold text-primary">12M+</h3>
          <BentoDesc>
            Deep insights from millions of historical and current property sales
          </BentoDesc>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="gold">Time Saved</BentoLabel>
          <h3 className="font-head text-5xl font-semibold text-primary">25k+</h3>
          <BentoDesc>
            <span className="text-primary font-semibold">AI-powered</span> analysis reduces research time for investors worldwide
          </BentoDesc>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="coral">Prediction Accuracy</BentoLabel>
          <h3 className="font-head text-5xl font-semibold text-primary">92%</h3>
          <BentoDesc>
            High precision forecasting based on proprietary multi-agent algorithms
          </BentoDesc>
        </BentoCell>
      </BentoGrid>
    </section>
  )
}
