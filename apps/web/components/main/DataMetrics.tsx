'use client'

import { useState } from 'react'
import BuyerAffordabilityChart from '../chart/BuyerAffordabilityChart'
import PortfolioBenchmarkChart from '../chart/PortfolioBenchmarkChart'

export default function DataMetrics() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'investor'>('investor')

  return (
    <section id="analytics" className="py-16 px-10 border-b border-grid-20">
      <div className="flex items-baseline gap-5 mb-10">
        <h2 className="display-text text-5xl">DATA & METRICS</h2>
        <span className="mono-label opacity-50">LIVE FEED</span>
      </div>

      <div className="flex justify-center gap-5 mb-8">
        <button
          className={`btn ${activeTab === 'buyer' ? 'btn-solid' : ''}`}
          onClick={() => setActiveTab('buyer')}
        >
          Buyer
        </button>
        <button
          className={`btn ${activeTab === 'investor' ? 'btn-solid' : ''}`}
          onClick={() => setActiveTab('investor')}
        >
          Investor
        </button>
      </div>

      {/* Buyer Content */}
      {activeTab === 'buyer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-5 border border-grid-20">
            <h4 className="mono-label">Buyer Affordability Index</h4>
            <BuyerAffordabilityChart />
          </div>
          <div className="grid grid-rows-2 gap-5">
            <div className="bg-white p-5 border border-grid-20">
              <h4 className="mono-label">Neighborhood Scoring</h4>
              <p className="text-sm text-grid mt-2">
                Rank neighborhoods based on schools, amenities, and future growth potential
              </p>
            </div>
            <div className="bg-white p-5 border border-grid-20 flex items-center gap-8">
              <div>
                <div className="mono-label">Match</div>
                <div className="text-[32px] font-head text-primary">85%</div>
              </div>
              <div>
                <div className="mono-label">Schools</div>
                <div className="text-[32px] font-head text-primary">9.2</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Investor Content */}
      {activeTab === 'investor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-5 border border-grid-20">
            <h4 className="mono-label ">Investor ROI Tracking</h4>
            <PortfolioBenchmarkChart />
          </div>
          <div className="grid grid-rows-2 gap-5">
            <div className="bg-white p-5 border border-grid-20">
              <h4 className="mono-label">Portfolio Performance</h4>
              <p className="text-sm text-grid mt-2">
                Monitor your portfolio performance with real-time analytics
              </p>
            </div>
            <div className="bg-white p-5 border border-grid-20 flex items-center gap-8">
              <div>
                <div className="mono-label">Avg. ROI</div>
                <div className="text-[32px] font-head text-primary">12.8%</div>
              </div>
              <div>
                <div className="mono-label">YoY Growth</div>
                <div className="text-[32px] font-head text-primary">+15%</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
