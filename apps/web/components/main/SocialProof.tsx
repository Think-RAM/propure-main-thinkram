import Image from 'next/image'
import { Lock, Shield } from 'lucide-react'
import { BentoGrid, BentoCell, BentoLabel } from './BentoGrid'

export default function SocialProof() {
  const reviews = [
    {
      stars: 5,
      quote: 'Propure makes complex data approachable. Found my property in 3 days.',
      author: 'Sarah Chen',
    },
    {
      stars: 4,
      quote: "Helped me understand complex metrics without getting overwhelmed.",
      author: 'Michael Torres',
    },
  ]

  const experts = [
    {
      name: 'Dr. Jane Mitchell',
      title: 'PhD Real Estate Econ.',
      image: 'https://picsum.photos/seed/expert1/100/100',
    },
    {
      name: 'Robert Williams',
      title: 'Licensed Agent, 20yrs',
      image: 'https://picsum.photos/seed/expert2/100/100',
    },
  ]

  const trustBadges = ['CoreLogic', 'ABS', 'REA Group', 'Domain']

  return (
    <section className="py-20 px-10 border-b border-grid-20">
      <div className="flex items-baseline gap-5 mb-10">
        <h2 className="display-text text-5xl">SOCIAL PROOF</h2>
      </div>

      <BentoGrid cols={3}>
        <BentoCell>
          <BentoLabel color="teal">User Reviews</BentoLabel>
          {reviews.map((review, index) => (
            <div key={index} className={index > 0 ? 'mt-5' : ''}>
              <div className="text-gold text-[10px]">
                {'★'.repeat(review.stars)}
                {'☆'.repeat(5 - review.stars)}
              </div>
              <p className="italic text-xs my-2.5">&ldquo;{review.quote}&rdquo;</p>
              <span className="font-mono text-[10px]">— {review.author}</span>
            </div>
          ))}
        </BentoCell>

        <BentoCell>
          <BentoLabel color="mint">Expert Validation</BentoLabel>
          {experts.map((expert, index) => (
            <div
              key={index}
              className={`flex gap-4 items-center ${index > 0 ? 'mt-5' : ''}`}
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                <img
                  src={expert.image}
                  alt={expert.name}
                  width={40}
                  height={40}
                  className="w-full grayscale"
                />
              </div>
              <div>
                <strong className="text-sm block">{expert.name}</strong>
                <span className="mono-sub">{expert.title}</span>
              </div>
            </div>
          ))}
        </BentoCell>

        <BentoCell>
          <BentoLabel color="gold">Trust Badges</BentoLabel>
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {trustBadges.map((badge) => (
              <div
                key={badge}
                className="border border-grid-20 p-2.5 text-center font-mono text-[10px]"
              >
                {badge}
              </div>
            ))}
          </div>
          <div className="flex gap-2.5">
            <div className="flex items-center gap-1.5 font-mono text-[10px] border border-grid-20 p-1.5">
              <Lock size={12} /> SOC 2
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] border border-grid-20 p-1.5">
              <Shield size={12} /> GDPR
            </div>
          </div>
        </BentoCell>
      </BentoGrid>
    </section>
  )
}
