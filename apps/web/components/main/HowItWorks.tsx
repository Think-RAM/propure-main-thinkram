'use client';
import { TerminalSquare, Cpu, Binary } from "lucide-react";

const steps = [
  {
    id: 'step_01',
    icon: <TerminalSquare className="w-6 h-6 text-slate-400 group-hover:text-[#d4ff00]" />,
    title: 'Input_Parameters',
    lines: [
      '> User defines budget',
      '> User sets strategy',
      '> System accepts criteria'
    ],
    highlighted: true
  },
  {
    id: 'step_02',
    icon: <Cpu className="w-6 h-6 text-slate-400 group-hover:text-[#d4ff00]" />,
    title: 'Process_Data',
    lines: [
      '> AI scans 15k markets',
      '> Algorithms filter matches',
      '> Risk verification run'
    ],
    highlighted: false
  },
  {
    id: 'step_03',
    icon: <Binary className="w-6 h-6 text-slate-400 group-hover:text-[#d4ff00]" />,
    title: 'Output_Result',
    lines: [
      '> Asset selected',
      '> Report generated',
      '> Execution ready'
    ],
    highlighted: false
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-[#0f1115] relative overflow-hidden">
      {/* Console Background Grid */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(45, 51, 59, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(45, 51, 59, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="font-libre-baskerville text-4xl text-white mb-4">System Architecture</h2>
          <p className="font-mono text-xs text-[#d4ff00] uppercase tracking-widest">
            INITIALIZING SEQUENCE...
          </p>
        </div>

        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-800 -z-10" />

          {steps.map((step, index) => (
            <div
              key={step.id}
              className="relative bg-[#14161a] border border-[#2d333b] p-8 hover:border-[#d4ff00] transition-colors group"
            >
              {/* Step Label */}
              <div className="absolute -top-3 left-4 bg-[#0f1115] px-2 font-mono text-[10px] uppercase border transition-colors">
                <span
                  className={
                    step.highlighted
                      ? 'text-[#d4ff00] border-[#d4ff00]'
                      : 'text-slate-500 border-slate-700 group-hover:text-[#d4ff00] group-hover:border-[#d4ff00]'
                  }
                >
                  {step.id}
                </span>
              </div>

              {/* Icon Box */}
              <div className="w-12 h-12 bg-[#0f1115] border border-slate-700 flex items-center justify-center mb-6 group-hover:border-[#d4ff00] group-hover:shadow-[0_0_15px_rgba(212,255,0,0.3)] transition-all">
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {step.icon}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-mono text-lg text-white mb-2 uppercase">
                {step.title}
              </h3>

              {/* Console Lines */}
              <div className="font-mono text-xs text-slate-500 leading-relaxed">
                {step.lines.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>

              {/* Corner Decorations */}
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-slate-700 group-hover:border-[#d4ff00] transition-colors" />
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-slate-700 group-hover:border-[#d4ff00] transition-colors" />
            </div>
          ))}
        </div>

        {/* Scanning Line Animation */}
        <div className="mt-20 relative h-px w-full bg-slate-800">
          <div
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-[#d4ff00] to-white shadow-[0_0_10px_#d4ff00]"
            style={{
              animation: 'scan 3s linear infinite'
            }}
          />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0f1115] px-4 font-mono text-[10px] text-slate-600">
            SYSTEM_READY
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </section>
  );
}