'use client'

import Image from 'next/image'

export default function Hero() {
  return (
    <section className="pt-40 pb-32 min-h-[90vh] grid lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center border-b border-grid-20 px-10">
      <div className="hero-content">
        <div className="inline-flex items-center gap-2.5 px-3 py-1 border border-primary mb-6">
          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          <span className="mono-label">System Operational</span>
        </div>

        <h1 className="display-text text-5xl lg:text-[80px] mb-8">
          WHERE PREDICTIVE ANALYTICS MEETS FINANCIAL FREEDOM.
        </h1>

        <div className="font-mono text-sm text-grid uppercase border-l border-primary pl-5 mb-10 leading-relaxed">
          Get exclusive predictive methods, industry expert guidance, and{' '}
          <span className="text-primary font-semibold">AI-driven</span> research tools to build a high-performing investment portfolio.
        </div>

        <div className="flex gap-4 mb-10">
          <button className="btn btn-solid">Start FREE with Basics</button>
          <button 
            className="btn"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            How It Works
          </button>
        </div>

        <div className="flex gap-8">
          <StatBox value="92%" label="Prediction Accuracy" />
          <StatBox value="50k+" label="Properties Analyzed" />
          <StatBox value="4.9" label="Investor Rating" />
        </div>
      </div>

      <div className="relative h-[500px] border border-grid-20 p-5 flex flex-col justify-center items-center">
        <div className="w-full h-full border border-dashed border-grid-20 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] border border-dashed border-grid-30 rounded-full animate-orbit">
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-primary -translate-x-1/2 rounded-full" />
          </div>
          <img
            src="https://picsum.photos/seed/propure-dashboard/600/500"
            alt="Dashboard"
            width={200}
            height={150}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover border border-secondary transition-all"
          />
        </div>
      </div>
    </section>
  )
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <span className="text-[32px] font-head font-bold text-primary block">
        {value}
      </span>
      <span className="mono-sub">{label}</span>
    </div>
  )
}