'use client';

import { useState } from 'react';
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const scenarios = [
  {
    id: 'discovery',
    title: 'Scenario A — Discovery',
    subtitle: 'First-time investor with $500k looking for guidance on where to invest.',
    messages: [
      {
        type: 'user',
        text: "I have $500k to invest in property, but I'm not sure where to start. What should I do?"
      },
      {
        type: 'ai',
        text: "I'd be happy to help you get started! To provide the best guidance, I need to understand your situation better. Are you looking for:\n\n1. Regular rental income (cash flow strategy)\n2. Long-term value growth (capital growth strategy)\n3. Quick profit through renovation (flip strategy)"
      },
      {
        type: 'user',
        text: "I'm interested in regular rental income since I'm planning to retire in 10 years."
      },
      {
        type: 'ai',
        text: "Based on your goal of regular rental income, I recommend a cash flow strategy. For your $500k budget, I've identified 3 suburbs with yields above 5%:\n\n• Logan (QLD) - 5.8% yield, median price $480k\n• Frankston (VIC) - 5.4% yield, median price $520k\n• Armadale (WA) - 5.6% yield, median price $490k\n\nWould you like me to analyze any of these areas in more detail?"
      }
    ],
    insights: [
      '> Strategy identified: Cash Flow',
      '> Risk profile: Conservative',
      '> Time horizon: 10 years',
      '> Recommended LVR: 70%'
    ]
  },
  {
    id: 'analysis',
    title: 'Scenario B — Analysis',
    subtitle: 'Experienced investor evaluating a specific property for portfolio addition.',
    messages: [
      {
        type: 'user',
        text: "Is this property at 123 Main St, Brisbane overpriced at $650k? It's a 3-bedroom house on 600sqm."
      },
      {
        type: 'ai',
        typing: true
      },
      {
        type: 'ai',
        text: "I've analyzed the property at 123 Main St, Brisbane. Here's my assessment:\n\nPrice Analysis:\n• Recent comparable sales: $620k-$660k\n• Current asking price: $650k\n• Price position: Slightly above median but within range\n\nFinancial Metrics:\n• Estimated rental: $550/week\n• Gross yield: 4.4%\n• Estimated growth: 8-10% annually\n\nRisk Factors:\n• Flood risk: Low\n• Distance to CBD: 8km\n• School zone: Highly rated primary school\n\nBased on these factors, I believe the property is fairly priced at $650k, though you might negotiate down to $635k-$640k."
      },
      {
        type: 'user',
        text: "What about the rental yield? It seems low for Brisbane."
      },
      {
        type: 'ai',
        text: "You're right that 4.4% is below Brisbane's average of 4.8%. However, this property compensates with:\n\n• Above-average capital growth potential (8-10% vs city average of 6%)\n• Lower vacancy risk due to school zone\n• Renovation potential to increase rent to $600/week\n\nIf you prioritize cash flow, I can suggest alternatives with higher yields in the same price range."
      }
    ],
    insights: [
      '> Price assessment: Fair',
      '> Yield: Below average',
      '> Growth potential: High',
      '> Recommendation: Consider if growth-focused'
    ]
  },
  {
    id: 'strategy',
    title: 'Scenario C — Strategy',
    subtitle: 'Investor comparing different suburbs for portfolio diversification.',
    messages: [
      {
        type: 'user',
        text: "Compare Paddington vs Ashgrove for investment. I'm looking for a balance of growth and rental yield."
      },
      {
        type: 'ai',
        text: "I've analyzed both suburbs for you. Here's the comparison:\n\nPaddington:\n• Median price: $1.2M\n• Rental yield: 3.8%\n• 5-year growth: 45%\n• Demographics: Young professionals, high income\n• Amenities: Excellent cafes, boutiques, transport\n\nAshgrove:\n• Median price: $950k\n• Rental yield: 4.2%\n• 5-year growth: 38%\n• Demographics: Families, professionals\n• Amenities: Good schools, parks, transport\n\nFor your balance of growth and yield, Ashgrove might be the better choice. It offers a higher yield while still providing solid growth potential."
      },
      {
        type: 'user',
        text: "What about the long-term outlook for both areas?"
      },
      {
        type: 'ai',
        text: "Looking at the 10-year projections:\n\nPaddington:\n• Projected 10-year growth: 85%\n• Infrastructure: New Cross River Rail station\n• Development pressure: High (limited land)\n• Risk: Market sensitivity to economic changes\n\nAshgrove:\n• Projected 10-year growth: 75%\n• Infrastructure: Road upgrades planned\n• Development pressure: Medium\n• Risk: More stable during market downturns\n\nIf you have a longer investment horizon (10+ years), Paddington's higher growth potential might outweigh the lower yield. For a more balanced approach, Ashgrove remains my recommendation."
      }
    ],
    insights: [
      '> Recommendation: Ashgrove',
      '> Reason: Better yield/growth balance',
      '> Alternative: Paddington for long-term growth',
      '> Strategy: Portfolio diversification'
    ]
  }
];

export default function UseCases() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % scenarios.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + scenarios.length) % scenarios.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % scenarios.length);
    }, 3000); // ⏱️ change speed here (ms)

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      id="use-cases"
      className="py-24 bg-[#0A192F] relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-libre-baskerville text-4xl text-white mb-4">Use Case Scenarios</h2>
          <p className="font-mono text-emerald-400">&gt; SIMULATING_INVESTMENT_JOURNEYS</p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Slider Container */}
          <div
            className="relative overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {scenarios.map((scenario) => (
                <div key={scenario.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                    {/* Window Header */}
                    <div className="bg-slate-800 px-4 py-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        Scenario: {scenario.id}
                      </div>
                      <div className="w-4" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="mb-6">
                        <h3 className="font-libre-baskerville text-2xl text-white mb-2">
                          {scenario.title}
                        </h3>
                        <p className="text-slate-400 mb-4">{scenario.subtitle}</p>
                      </div>

                      {/* Chat Interface */}
                      <div className="bg-[#14161a] border border-[#2d333b] rounded-lg h-[300px] flex flex-col mb-6">
                        {/* Chat Header */}
                        <div className="px-4 py-3 border-b border-[#2d333b] flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            AI
                          </div>
                          <span className="text-white font-mono text-sm">Propure AI</span>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
                          {scenario.messages.map((msg, idx) => (
                            <div key={idx}>
                              {msg.typing ? (
                                <div className="flex gap-1 py-2">
                                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '200ms' }} />
                                  <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '400ms' }} />
                                </div>
                              ) : (
                                <div
                                  className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.type === 'user'
                                    ? 'ml-auto bg-teal-500 text-white rounded-br-none'
                                    : 'bg-[#2d333b] text-gray-200 rounded-bl-none'
                                    }`}
                                >
                                  {msg.text?.split('\n').map((line, i) => (
                                    <span key={i}>
                                      {line}
                                      {i < (msg.text?.split('\n').length || 0) - 1 && <br />}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Input */}
                        <div className="px-4 py-3 border-t border-[#2d333b] flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type your message..."
                            disabled
                            className="flex-1 bg-transparent border-none outline-none text-white text-sm"
                          />
                          <button className="text-teal-400">
                            <span className="text-xl">➤</span>
                          </button>
                        </div>
                      </div>

                      {/* Insights */}
                      <div className="bg-slate-800 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">ℹ️</span>
                          <span className="font-mono text-xs text-emerald-400 uppercase">
                            Key Insights
                          </span>
                        </div>
                        <div className="font-mono text-xs text-slate-400">
                          {scenario.insights.map((insight, idx) => (
                            <div key={idx}>{insight}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
            <button
              onClick={prevSlide}
              className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-teal-600 transition-colors pointer-events-auto"
            >
              <ChevronLeft className="w-5 h-5 text-current" />
            </button>
            <button
              onClick={nextSlide}
              className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white hover:bg-teal-600 transition-colors pointer-events-auto"
            >
              <ChevronRight className="w-5 h-5 text-current" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {scenarios.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${currentSlide === idx ? 'bg-teal-500' : 'bg-white/30'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}