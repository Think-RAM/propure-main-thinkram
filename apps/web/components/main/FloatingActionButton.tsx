'use client'

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'

export default function FloatingActionButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        className="fixed bottom-5 right-5 w-[60px] h-[60px] bg-primary text-white rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(20,184,166,0.3)] hover:bg-primary-dark transition-colors z-[900]"
        onClick={() => setIsModalOpen(true)}
      >
        <MessageCircle size={24} />
      </button>

      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-paper/95 backdrop-blur-sm z-[2000] flex items-center justify-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-paper border border-grid p-10 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-2xl text-grid hover:text-primary"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>

            <h3 className="display-text text-2xl mb-5">ACCESS REQUEST</h3>
            <p className="mono-sub mb-8">Select your preferred protocol.</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <button className="btn border-grid-20 text-grid">Starter</button>
              <button className="btn btn-solid">Growth</button>
            </div>

            <form>
              <div className="mb-4">
                <label className="mono-label block mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full p-2.5 border border-grid-20 font-mono text-sm"
                  placeholder="your@email.com"
                />
              </div>
              <button type="submit" className="btn btn-solid w-full mt-5">
                Confirm
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
