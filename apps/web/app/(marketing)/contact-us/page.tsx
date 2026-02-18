'use client'

import { useEffect, useRef, useState } from 'react'
import Header from '@/components/main/Header'
import Footer from '@/components/main/Footer'
import { 
  Send, 
  Satellite, 
  Headset, 
  Share2, 
  MapPin, 
  Clock, 
  Globe, 
  Mail, 
  Phone, 
  MessageCircle,
  Linkedin,
  Twitter,
  Github,
  SatelliteDish
} from 'lucide-react'

// Hook for scroll reveal animation
function useScrollReveal() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    
    document.querySelectorAll('.reveal').forEach((el) => {
      observerRef.current?.observe(el)
    })
    
    return () => observerRef.current?.disconnect()
  }, [])
}

// Scroll Progress Bar Component
function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setProgress(scrolled)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div 
      className="fixed top-0 left-0 h-[2px] bg-primary z-[2000] transition-[width] duration-100"
      style={{ width: `${progress}%` }}
    />
  )
}

// Background Orbs Component
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-40 bg-primary/10 -top-[10%] -left-[10%] animate-float" />
      <div className="absolute w-[300px] h-[300px] rounded-full blur-[80px] opacity-40 bg-secondary/5 bottom-[10%] -right-[5%] animate-float [animation-delay:-5s]" />
      <div className="absolute w-[200px] h-[200px] rounded-full blur-[80px] opacity-40 bg-mint/10 top-[40%] left-[60%] animate-float [animation-delay:-10s]" />
    </div>
  )
}

// Bento Cell Component
function BentoCell({ 
  children, 
  className = '',
  delay = 0
}: { 
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const delayClass = delay === 1 ? 'reveal-delay-1' : delay === 2 ? 'reveal-delay-2' : delay === 3 ? 'reveal-delay-3' : ''
  
  return (
    <div className={`reveal ${delayClass} bg-white p-10 border border-grid-20 flex flex-col justify-center min-h-[400px] transition-all duration-400 relative overflow-hidden hover:-translate-y-2 hover:border-primary hover:shadow-[0_20px_40px_rgba(20,184,166,0.08)] group ${className}`}>
      {/* Top accent line on hover */}
      <div className="absolute top-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
      {children}
    </div>
  )
}

// Info Item Component
function InfoItem({ 
  icon: Icon, 
  title, 
  text, 
  subText,
  secondaryText
}: { 
  icon: React.ElementType
  title: string
  text: string
  subText: string
  secondaryText?: string
}) {
  return (
    <li className="flex items-start gap-4 p-4 border border-dashed border-grid-20 transition-colors hover:bg-primary/5">
      <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
        <Icon className="text-primary" size={18} />
      </div>
      <div>
        <h4 className="font-head text-lg font-bold text-secondary mb-1">{title}</h4>
        <p className="text-sm text-grid leading-relaxed">{text}</p>
        {secondaryText && (
          <p className="text-sm text-grid leading-relaxed">{secondaryText}</p>
        )}
        <span className="font-mono text-xs text-grid/50 uppercase mt-2 block tracking-wider">{subText}</span>
      </div>
    </li>
  )
}

// Corner Markers Component
function CornerMarkers() {
  return (
    <>
      <div className="absolute -top-px -left-px w-2.5 h-2.5 border-2 border-secondary border-r-0 border-b-0 z-10" />
      <div className="absolute -top-px -right-px w-2.5 h-2.5 border-2 border-secondary border-l-0 border-b-0 z-10" />
      <div className="absolute -bottom-px -left-px w-2.5 h-2.5 border-2 border-secondary border-r-0 border-t-0 z-10" />
      <div className="absolute -bottom-px -right-px w-2.5 h-2.5 border-2 border-secondary border-l-0 border-t-0 z-10" />
    </>
  )
}

// Form Component
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  })
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }
  
  return (
    <div className="w-full">
      <div className="bg-white border border-grid-20 p-10 relative flex flex-col gap-5">
        <CornerMarkers />
        
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-grid mb-2">
              Identity / Name
            </label>
            <input
              type="text"
              className="w-full p-4 bg-white border border-grid-20 font-body text-base text-grid outline-none transition-colors focus:border-primary"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="mb-5">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-grid mb-2">
              Comms / Email
            </label>
            <input
              type="email"
              className="w-full p-4 bg-white border border-grid-20 font-body text-base text-grid outline-none transition-colors focus:border-primary"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          
          <div className="mb-5">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-grid mb-2">
              Subject / Protocol
            </label>
            <select
              className="w-full p-4 bg-white border border-grid-20 font-body text-base text-grid outline-none transition-colors focus:border-primary cursor-pointer"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            >
              <option>General Inquiry</option>
              <option>Enterprise Sales</option>
              <option>Partnership Request</option>
              <option>Technical Support</option>
            </select>
          </div>
          
          <div className="mb-5">
            <label className="block font-mono text-[10px] uppercase tracking-wider text-grid mb-2">
              Message / Payload
            </label>
            <textarea
              className="w-full p-4 bg-white border border-grid-20 font-body text-base text-grid outline-none transition-colors focus:border-primary resize-y min-h-[150px]"
              placeholder="Enter your message details here..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          
          <div className="text-right">
            <button
              type="submit"
              className="bg-secondary text-white border-none py-4 px-8 font-mono text-xs uppercase tracking-wider cursor-pointer transition-all hover:bg-primary hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(20,184,166,0.2)]"
            >
              Transmit Data
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ContactUsPage() {
  useScrollReveal()
  
  return (
    <div className="min-h-screen bg-paper">
      <ScrollProgress />
      <BackgroundOrbs />
      <Header path="/contact-us" />
      
      <main>
        {/* Hero Section */}
        <section className="pt-[180px] pb-[120px] min-h-[70vh] flex flex-col items-center justify-center border-b border-grid-20 text-center px-5">
          <div className="reveal">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 border border-grid-20 mb-8 bg-white">
              <div className="w-2 h-2 bg-mint rounded-full" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-grid">System Operational</span>
            </div>
            
            {/* Title */}
            <h1 className="font-head text-5xl md:text-7xl font-bold text-secondary mb-8 tracking-tight leading-none">
              INITIATE CONNECTION
              {/* <br /> */}
              <span className="ml-4 text-primary">PROTOCOL</span>
            </h1>
            
            {/* Subtext */}
            <div className="font-mono text-sm text-grid border-l-2 border-primary pl-5 max-w-[600px] leading-relaxed opacity-90">
              We are ready to assist. Select a channel below to begin transmission.
            </div>
          </div>
        </section>
        
        {/* Contact Bento Grid Section */}
        <section className="py-20 px-[5vw] border-b border-grid-20">
          {/* Section Header */}
          <div className="reveal flex items-baseline gap-5 mb-16 flex-wrap">
            <h2 className="font-head text-4xl md:text-5xl font-bold text-secondary tracking-tight">
              COMMUNICATION HUB
            </h2>
            <span className="font-mono text-xs text-primary border border-grid-20 px-3 py-1 rounded-full">
              CHANNELS
            </span>
          </div>
          
          {/* Bento Grid - 2x2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cell 1: Contact Form */}
            <BentoCell>
              <div className="text-center mb-5">
                <Send className="mx-auto text-primary" size={32} />
                <h3 className="font-head text-2xl font-bold text-secondary mt-2.5">Direct Uplink</h3>
              </div>
              <ContactForm />
            </BentoCell>
            
            {/* Cell 2: Headquarters */}
            <BentoCell delay={1}>
              <div className="text-center mb-8">
                <SatelliteDish className="mx-auto text-coral" size={46} />
                <h3 className="font-head font-bold text-2xl text-secondary mt-2.5">Headquarters</h3>
              </div>
              
              <ul className="list-none w-full flex flex-col gap-5">
                <InfoItem
                  icon={MapPin}
                  title="Location"
                  text="Level 4, 100 Barangaroo Avenue"
                  secondaryText="Sydney, NSW 2000, Australia"
                  subText="Lat: -33.8688 | Lng: 151.2093"
                />
                <InfoItem
                  icon={Clock}
                  title="Operation Hours"
                  text="09:00 - 18:00 AEST"
                  subText="Mon - Fri"
                />
                <InfoItem
                  icon={Globe}
                  title="Timezone"
                  text="UTC+10 (Sydney)"
                  subText="Server Active"
                />
              </ul>
            </BentoCell>
            
            {/* Cell 3: Support Channels */}
            <BentoCell delay={2}>
              <div className="text-center mb-8">
                <Headset className="mx-auto text-gold" size={32} />
                <h3 className="font-head font-bold text-2xl text-secondary mt-2.5">Support</h3>
              </div>
              
              <ul className="list-none w-full flex flex-col gap-5">
                <InfoItem
                  icon={Mail}
                  title="Email Support"
                  text="support@propure.ai"
                  subText="Response: < 24 Hours"
                />
                <InfoItem
                  icon={Phone}
                  title="Sales Hotline"
                  text="+61 2 9000 1234"
                  subText="Local Charge Applies"
                />
                <InfoItem
                  icon={MessageCircle}
                  title="Enterprise Chat"
                  text="WhatsApp Business"
                  subText="Available for Pro Plans"
                />
              </ul>
            </BentoCell>
            
            {/* Cell 4: Network / Social */}
            <BentoCell delay={3}>
              <div className="text-center mb-8">
                <Share2 className="mx-auto text-mint" size={32} />
                <h3 className="font-head text-2xl font-bold text-secondary mt-2.5">Network</h3>
              </div>
              
              <ul className="list-none w-full flex flex-col gap-5">
                <InfoItem
                  icon={Linkedin}
                  title="LinkedIn"
                  text="Propure AI"
                  subText="Company Updates"
                />
                <InfoItem
                  icon={Twitter}
                  title="Twitter / X"
                  text="@propure_ai"
                  subText="News Feed"
                />
                <InfoItem
                  icon={Github}
                  title="GitHub"
                  text="github.com/propure"
                  subText="Dev Status"
                />
              </ul>
            </BentoCell>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
