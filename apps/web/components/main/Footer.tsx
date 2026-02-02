import { Layers } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-20 px-10 border-t border-grid-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-16">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <Layers className="text-white" size={14} />
            </div>
            <span className="font-head font-bold text-xl text-primary">Propure</span>
          </div>
          <p className="mono-sub">
            AI-powered property investment insights for smarter decisions.
          </p>
        </div>

        <FooterColumn title="Product">
          <FooterLink href="#">Features</FooterLink>
          <FooterLink href="#">API</FooterLink>
        </FooterColumn>

        <FooterColumn title="Company">
          <FooterLink href="#">About</FooterLink>
          <FooterLink href="#">Careers</FooterLink>
          <FooterLink href="#">Legal</FooterLink>
        </FooterColumn>

        <FooterColumn title="Connect">
          <FooterLink href="#">Twitter</FooterLink>
          <FooterLink href="#">LinkedIn</FooterLink>
          <FooterLink href="#">GitHub</FooterLink>
        </FooterColumn>
      </div>

      <div className="pt-5 border-t border-grid-20 flex flex-col md:flex-row justify-between font-mono text-[10px] uppercase text-grid gap-4">
        <span>&copy; 2023 Propure Systems.</span>
        <span>Status: All Systems Operational</span>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h5 className="mono-label mb-5">{title}</h5>
      <ul className="space-y-3">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        className="text-grid font-body text-sm hover:text-primary transition-colors"
      >
        {children}
      </a>
    </li>
  )
}
