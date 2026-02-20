'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: "How accurate are Propure's property predictions?",
    answer: "Propure's AI model has an 87% accuracy rate in predicting property market trends. Our system analyzes over 80 different metrics and leverages historical data spanning 50+ years.",
  },
  {
    question: 'What data sources does Propure use?',
    answer: 'Propure integrates with leading data partners including CoreLogic, REA Group, Domain, and Australian Bureau of Statistics.',
  },
  {
    question: "Can I use Propure if I'm a first-time investor?",
    answer: "Absolutely! Propure is designed to be accessible for investors at all experience levels.",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="py-20 px-10 border-b border-grid-20">
      <div className="flex items-baseline gap-5 mb-10">
        <h2 className="display-text text-5xl">SYSTEM FAQ</h2>
      </div>

      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </div>
    </section>
  )
}

function FAQItem({
  question,
  answer,
  isOpen,
  onClick,
}: {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <div className="border-b border-grid-20">
      <button
        className="w-full py-5 flex justify-between items-center text-left font-head font-semibold hover:text-primary transition-colors"
        onClick={onClick}
      >
        {question}
        <ChevronDown
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          size={20}
        />
      </button>
      {isOpen && (
        <div className="pb-5 font-body text-grid text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}
