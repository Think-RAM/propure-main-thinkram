'use client';

import { useEffect, useState } from 'react';

import { Cpu, Lightbulb, BarChart, BrainCircuit, Rocket, BarChart2, ShieldAlert, Radar, Map } from 'lucide-react';

type FeatureItem = {
      icon?: React.ReactNode | string;
      iconColor?: string;
      title?: string;
      description?: string;
      console?: string[];
      hasProgressBar?: boolean;
      isCTA?: boolean;
};

type Feature = {
      id: string;
      label: string;
      tag: string;
      items?: FeatureItem[];
      isAgentsSection?: boolean;
};

const features: Feature[] = [
      {
            id: 'feature-discovery',
            label: 'Discovery',
            tag: '01. Market Intelligence',
            items: [
                  {
                        icon: <Radar className="w-8 h-8 text-teal-500 mb-6" />,
                        iconColor: 'text-teal-500',
                        title: 'Market Intelligence Engine',
                        description: 'Real-time data stream analyzing 15,000+ markets for opportunities. Access ABS census data and live sales records.',
                        console: [
                              '> FETCHING DATA...',
                              '> SOURCE: ABSCENSUS',
                              '> UPDATERATE: 15_MIN'
                        ]
                  },
                  {
                        icon: <Map className="w-8 h-8 text-indigo-500 mb-6" />,
                        iconColor: 'text-indigo-500',
                        title: 'StreetLens & GeoDex',
                        description: 'Street-level performance data and interactive market heatmaps for pinpointing growth corridors.',
                        console: [
                              '> SCANNING GEOCOORDS...',
                              '> NEIGHBORHOODSCORE: 9.2/10',
                              '> AMENITY_DENSITY: HIGH'
                        ]
                  }
            ]
      },
      {
            id: 'feature-analysis',
            label: 'Analysis',
            tag: '02. Deep Analysis',
            items: [
                  {
                        icon: <BarChart2 className="w-8 h-8 text-violet-500 mb-6" />,
                        iconColor: 'text-violet-500',
                        title: 'Advanced Portfolio Modelling',
                        description: 'Multi-scenario modeling to test investment strategies with precision. Simulate interest rate changes and cashflow.',
                        console: [
                              '> INITIALIZING SCENARIO A...',
                              '> RISKFACTOR: LOW',
                              '> PROJECTED_YIELD: +12.4%'
                        ]
                  },
                  {
                        icon: <ShieldAlert className="w-8 h-8 text-red-400 mb-6" />,
                        iconColor: 'text-red-400',
                        title: 'Risk Assessment System',
                        description: 'Advanced risk assessment models identify potential issues before they impact. Flood zones, vacancy rates, and volatility.',
                        hasProgressBar: true
                  }
            ]
      },
      {
            id: 'feature-strategy',
            label: 'Strategy',
            tag: '03. Strategic Execution',
            items: [
                  {
                        icon: <BrainCircuit className="w-8 h-8 text-emerald-500 mb-6" />,
                        iconColor: 'text-emerald-500',
                        title: 'Investment Strategy Advisor',
                        description: 'AI-powered advisor helps you develop and refine your investment strategy based on your personal financial goals.'
                  },
                  {
                        isCTA: true
                  }
            ]
      },
      {
            id: 'feature-agents',
            label: 'AI Agents',
            tag: '04. Multi-Agent System',
            isAgentsSection: true
      }
];

const agents = [
      {
            icon: <Cpu className="w-6 h-6 text-teal-600" />,
            color: 'bg-teal-100',
            title: 'Orchestrator',
            description: 'Routes requests to specialist agents, maintains conversation context, and synthesizes responses.'
      },
      {
            icon: <Lightbulb className="w-6 h-6 text-indigo-600" />,
            color: 'bg-indigo-100',
            title: 'Strategist',
            description: 'Discovers user circumstances, recommends investment strategies, and sets search parameters.'
      },
      {
            icon: <BarChart className="w-6 h-6 text-violet-600" />,
            color: 'bg-violet-100',
            title: 'Analyst',
            description: 'Performs financial calculations, risk assessments, and property scoring.'
      }
];

export default function FeatureScrollSpy() {
      const [activeSection, setActiveSection] = useState('feature-discovery');

      useEffect(() => {
            const handleScroll = () => {
                  const sections = features.map(f => f.id);
                  const scrollPosition = window.scrollY + 200;

                  for (const sectionId of sections) {
                        const element = document.getElementById(sectionId);
                        if (element) {
                              const { offsetTop, offsetHeight } = element;
                              if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                                    setActiveSection(sectionId);
                                    break;
                              }
                        }
                  }
            };

            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
      }, []);

      const scrollToSection = (id: string) => {
            const element = document.getElementById(id);
            if (element) {
                  const offset = 112;
                  const elementPosition = element.getBoundingClientRect().top;
                  const offsetPosition = elementPosition + window.pageYOffset - offset;

                  window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                  });
            }
      };

      return (
            <section className="bg-gray-50 py-24 scroll-mt-20">
                  <div className="container mx-auto px-6 flex flex-col lg:flex-row gap-12">
                        {/* Sticky Sidebar */}
                        <div className="hidden lg:block w-1/4">
                              <div className="sticky top-28">
                                    <h3 className="font-brand text-2xl font-bold text-navy-900 mb-8 pl-6">
                                          Core Services
                                    </h3>
                                    <div className="space-y-6 relative border-l border-gray-200 ml-3">
                                          {features.map((feature) => (
                                                <button
                                                      key={feature.id}
                                                      onClick={() => scrollToSection(feature.id)}
                                                      className={`block pl-6 relative transition-all duration-300 text-left w-full ${activeSection === feature.id
                                                                  ? 'text-teal-600 font-bold'
                                                                  : 'text-gray-400 hover:text-navy-900'
                                                            }`}
                                                >
                                                      <span
                                                            className={`absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeSection === feature.id
                                                                        ? 'bg-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.2)]'
                                                                        : 'bg-gray-300'
                                                                  }`}
                                                      />
                                                      {feature.label}
                                                </button>
                                          ))}
                                    </div>
                              </div>
                        </div>

                        {/* Main Content */}
                        <div className="w-full lg:w-3/4 space-y-32">
                              {features.map((feature) => (
                                    <div key={feature.id} id={feature.id} className="scroll-section">
                                          <div className="flex items-center gap-4 mb-12">
                                                <span className="text-teal-500 font-mono text-xs uppercase tracking-widest">
                                                      {feature.tag}
                                                </span>
                                                <div className="h-px flex-1 bg-gray-200" />
                                          </div>

                                          {feature.isAgentsSection ? (
                                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12">
                                                      <h3 className="font-libre-baskerville text-2xl text-navy-900 mb-6">
                                                            Propure&apos;s Multi-Agent Architecture
                                                      </h3>
                                                      <p className="text-stone-700/70 leading-relaxed mb-8">
                                                            Our system uses specialized AI agents working together to provide
                                                            comprehensive property investment analysis:
                                                      </p>

                                                      <div className="grid md:grid-cols-3 gap-8">
                                                            {agents.map((agent) => (
                                                                  <div key={agent.title} className="text-center">
                                                                        <div className={`w-16 h-16 mx-auto ${agent.color} rounded-full flex items-center justify-center mb-4`}>
                                                                              <span className={`text-3xl text-${agent.color}-600`}>
                                                                                    {/* {agent.icon === 'lucide:cpu' && '🔲'}
                            {agent.icon === 'lucide:lightbulb' && '💡'}
                            {agent.icon === 'lucide:bar-chart' && '📊'} */}
                                                                                    {agent.icon}
                                                                              </span>
                                                                        </div>
                                                                        <h4 className="font-brand text-xl font-bold text-navy-900 mb-2">
                                                                              {agent.title}
                                                                        </h4>
                                                                        <p className="text-stone-700/70 text-sm">
                                                                              {agent.description}
                                                                        </p>
                                                                  </div>
                                                            ))}
                                                      </div>

                                                      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                                  <span className="font-mono text-xs text-emerald-500 uppercase">
                                                                        System Status
                                                                  </span>
                                                            </div>
                                                            <p className="font-mono text-xs text-slate-500">
                                                                  &gt; All agents operational
                                                                  <br />
                                                                  &gt; Response time: 2.3s
                                                                  <br />
                                                                  &gt; Success rate: 98.7%
                                                            </p>
                                                      </div>
                                                </div>
                                          ) : (
                                                <div className="grid md:grid-cols-2 gap-12">
                                                      {feature.items?.map((item, idx) => (
                                                            <div key={idx}>
                                                                  {item?.isCTA ? (
                                                                        <div className="group bg-[#0A192F] p-8 rounded-2xl shadow-lg text-center flex flex-col items-center justify-center h-full relative overflow-hidden">

                                                                              {/* Overlay */}
                                                                              <div
                                                                                    className="
      absolute inset-0
      bg-gradient-to-br from-[#0A1B34] to-[#0E2A4A]
      opacity-100
      group-hover:opacity-70
      transition-opacity duration-300
      pointer-events-none
    "
                                                                              />

                                                                              {/* Icon */}
                                                                              <Rocket className="relative z-10 w-10 h-10 text-white mb-6 transition-transform duration-300 group-hover:-translate-y-1" />

                                                                              {/* Heading */}
                                                                              <h3 className="relative z-10 font-libre-baskerville text-2xl text-white mb-6">
                                                                                    Ready to Build Your Strategy?
                                                                              </h3>

                                                                              {/* Button */}
                                                                              <button className="relative z-10 px-8 py-4 bg-white text-navy-900 font-bold rounded-full hover:bg-teal-500 hover:text-white transition-all duration-300 shadow-lg">
                                                                                    Get Strategy
                                                                              </button>
                                                                        </div>

                                                                  ) : (
                                                                        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:border-teal-500/30 transition-all">
                                                                              <span className={`text-3xl ${item.iconColor} mb-6 block`}>
                                                                                    {/* {item.icon?.includes('radar') && '📡'}
                            {item.icon?.includes('map') && '🗺️'}
                            {item.icon?.includes('bar-chart') && '📊'}
                            {item.icon?.includes('shield') && '🛡️'}
                            {item.icon?.includes('brain') && '🧠'} */}
                                                                                    {item.icon}
                                                                              </span>
                                                                              <h3 className="font-libre-baskerville text-2xl text-navy-900 mb-4">
                                                                                    {item.title}
                                                                              </h3>
                                                                              <p className="text-stone-700/70 leading-relaxed mb-6">
                                                                                    {item.description}
                                                                              </p>

                                                                              {item.hasProgressBar ? (
                                                                                    <>
                                                                                          <div className="h-1 w-full bg-gray-200 rounded-full mt-auto">
                                                                                                <div className="h-full bg-emerald-500 w-3/4" />
                                                                                          </div>
                                                                                          <div className="flex justify-between mt-2 font-mono text-[10px] text-slate-500">
                                                                                                <span>SAFETY SCORE</span>
                                                                                                <span className="text-emerald-500">88/100</span>
                                                                                          </div>
                                                                                    </>
                                                                              ) : item.console ? (
                                                                                    <div className="bg-[#0A192F] p-4 rounded font-mono text-[10px] text-slate-400 leading-relaxed">
                                                                                          {item.console.map((line, i) => (
                                                                                                <div key={i}>{line}</div>
                                                                                          ))}
                                                                                    </div>
                                                                              ) : null}
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </div>
                              ))}
                        </div>
                  </div>
            </section>
      );
}