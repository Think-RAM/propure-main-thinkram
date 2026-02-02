import { BentoGrid, BentoCell, BentoLabel, BentoTitle, BentoDesc } from './BentoGrid'

export default function CoreServices() {
  return (
    <section id="services" className="py-20 px-10 border-b border-grid-20">
      <div className="flex items-baseline gap-5 mb-10">
        <h2 className="display-text text-5xl">CORE SERVICES</h2>
        <span className="mono-label opacity-50">SYSTEM V.2.0</span>
      </div>

      <BentoGrid cols={3}>
        <BentoCell>
          <BentoLabel color="teal">Data Intelligence</BentoLabel>
          <BentoTitle>Advanced Portfolio Modelling</BentoTitle>
          <BentoDesc>
            Multi-scenario modeling to test investment strategies with precision.
          </BentoDesc>
          <div className="mt-auto font-mono text-[10px] text-grid-30">
            &gt; INITIALIZING SCENARIO_A...<br />
            &gt; RISK_FACTOR: LOW<br />
            &gt; PROJECTED_YIELD: +12.4%
          </div>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="mint">Market Insight</BentoLabel>
          <BentoTitle>Market Intelligence Engine</BentoTitle>
          <BentoDesc>
            Real-time data stream analyzing 15,000+ markets for opportunities.
          </BentoDesc>
          <div className="mt-auto font-mono text-[10px] text-grid-30">
            &gt; FETCHING DATA...<br />
            &gt; SOURCE: ABS_CENSUS<br />
            &gt; UPDATE_RATE: 15_MIN
          </div>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="gold">Location Analysis</BentoLabel>
          <BentoTitle>StreetLens & GeoDex</BentoTitle>
          <BentoDesc>
            Street-level performance data and interactive market heatmaps.
          </BentoDesc>
          <div className="mt-auto font-mono text-[10px] text-grid-30">
            &gt; SCANNING GEO_COORDS...<br />
            &gt; NEIGHBORHOOD_SCORE: 9.2/10<br />
            &gt; AMENITY_DENSITY: HIGH
          </div>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="coral">Strategy</BentoLabel>
          <BentoTitle>Investment Strategy Advisor</BentoTitle>
          <BentoDesc>
            AI-powered advisor helps you develop and refine your investment strategy.
          </BentoDesc>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="teal">Risk Management</BentoLabel>
          <BentoTitle>Risk Assessment System</BentoTitle>
          <BentoDesc>
            Advanced risk assessment models identify potential issues before they impact.
          </BentoDesc>
        </BentoCell>

        <BentoCell className="bg-secondary text-white justify-center items-center text-center">
          <BentoTitle>
            <span className="text-white">AI Strategy Advisor</span>
          </BentoTitle>
          <button className="btn btn-solid border-white text-white mt-5">
            Get Strategy
          </button>
        </BentoCell>
      </BentoGrid>
    </section>
  )
}
