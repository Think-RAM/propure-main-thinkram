'use client'

export default function CTASection() {
  return (
    <section className="py-24 px-5 border-b border-grid-20">
      <div className="max-w-[600px] mx-auto bg-paper border border-grid-20 p-10 relative">
        {/* Corner decorations */}
        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-primary" />

        <h3 className="display-text text-center text-[32px] mb-5">
          READY TO DEPLOY?
        </h3>

        <form className="space-y-4">
          <div>
            <label className="mono-label block mb-1.5">Identity / Name</label>
            <input
              type="text"
              className="w-full p-2.5 border border-grid-20 bg-white font-mono text-sm"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="mono-label block mb-1.5">Communication / Email</label>
            <input
              type="email"
              className="w-full p-2.5 border border-grid-20 bg-white font-mono text-sm"
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" className="btn btn-solid w-full">
            EXECUTE REQUEST
          </button>
        </form>
      </div>
    </section>
  )
}
