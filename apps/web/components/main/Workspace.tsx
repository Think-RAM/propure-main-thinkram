import { Lock } from 'lucide-react'
import { BentoGrid, BentoCell, BentoLabel } from './BentoGrid'

export default function Workspace() {
  return (
    <section id="workspace" className="py-20 px-10 border-b border-grid-20">
      <div className="flex items-baseline gap-5 mb-10">
        <h2 className="display-text text-5xl">WORKSPACE TOOLS</h2>
        <span className="mono-label opacity-50">ACCESS CONTROL</span>
      </div>

      <BentoGrid cols={3}>
        <BentoCell>
          <BentoLabel color="teal">Tools</BentoLabel>
          <ul className="font-mono text-xs flex flex-col gap-3">
            <li className="opacity-50 blur-[1px]">Portfolio Modeling</li>
            <li className="opacity-50 blur-[1px]">Market Analytics</li>
            <li className="opacity-50 blur-[1px]">Property Valuation</li>
            <li className="opacity-50 blur-[1px]">Risk Assessment</li>
          </ul>
          <div className="mt-auto p-2.5 bg-[#f0f0f0] font-mono text-[10px] text-center flex items-center justify-center gap-2">
            <Lock size={12} /> LOGIN TO ACCESS
          </div>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="mint">Resources</BentoLabel>
          <ul className="font-mono text-xs flex flex-col gap-3">
            <li>For Investors</li>
            <li>For Professionals</li>
            <li>For Developers</li>
            <li>Downloadable Reports</li>
            <li>Eve GPT Assistant</li>
          </ul>
        </BentoCell>

        <BentoCell>
          <BentoLabel color="gold">Heatmaps</BentoLabel>
          <ul className="font-mono text-xs flex flex-col gap-3">
            <li>Markets in Moment</li>
            <li>Growth Hotspots</li>
            <li>Rental Yields</li>
            <li>Vacancy Rates</li>
          </ul>
        </BentoCell>
      </BentoGrid>
    </section>
  )
}
