'use client'
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { UserButton, useUser } from '@clerk/nextjs'

type HeaderProps = {
  path: string
}

export default function Header({ path }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  const { isLoaded, isSignedIn, user } = useUser()
  console.log("Checking path: ", path);
  useEffect(() => {
    if (path !== '/') {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [path]);



  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 h-20 border-b border-grid-20 flex items-center justify-between px-10 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-paper backdrop-blur-md shadow-lg py-4'
          : 'bg-transparent'
          }`}
      >
        <div className="flex items-center gap-4 cursor-pointer">
          <div className="w-8 h-8 bg-primary flex items-center justify-center">
            <Layers className="text-white" size={14} />
          </div>
          <span className="font-head font-bold text-xl text-primary">Propure</span>
        </div>

        <nav className="hidden lg:flex gap-16">
          <NavLink href="/" index="01" path={path == '/'} isScrolled={isScrolled}>Home</NavLink>
          <NavLink href="/pricing" index="02" path={path == '/pricing'} isScrolled={isScrolled}>Pricing</NavLink>
          <NavLink href="/about-us" index="03" path={path == '/about-us'} isScrolled={isScrolled}>About us</NavLink>
          <NavLink href="/contact-us" index="04" path={path == '/contact-us'} isScrolled={isScrolled}>Contact us</NavLink>
        </nav>

        <div className="flex gap-3">
          {!isSignedIn ? (
            <button className="btn hidden md:block" onClick={() => router.push('/sign-in')}>Login</button>
          ) : (<UserButton />)}
          <button
            className="btn btn-solid"
            onClick={() => setIsModalOpen(true)}
          >
            Get Access
          </button>
        </div>
      </motion.nav>
      {/* <header className=" ">

      </header> */}

      {isModalOpen && <AccessModal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}

function NavLink({ href, index, path, isScrolled, children }: { href: string; index: string; path: boolean; isScrolled: boolean; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className={`mono-label ${path ? 'text-primary': !isScrolled ?'text-white/90' : 'text-grid'} relative py-1 hover:text-primary transition-colors group`}
    >
      {/* <span className="text-primary font-bold mr-2">{index}.</span> */}
      {children}
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full" />
    </a>
  )
}

function AccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-paper/95 backdrop-blur-sm z-[2000] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-paper border border-grid p-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-2xl text-grid hover:text-primary"
          onClick={onClose}
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
  )
}
