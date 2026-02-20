import Image from "next/image";


export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="sticky top-0 z-50 w-full glass">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 hover-lift">
            <Image
              src="/logo.png"
              alt="Propure Logo"
              width={150}
              height={50}
              className=" object-cover"
            />
            <span className="text-3xl font-bold font-heading text-[#0c3c5d]">
              Propure
            </span>
          </div>
        </div>
      </header>
      <main className="flex-grow flex">
        <div className="w-full space-y-8">
          {children}
        </div>
      </main>
      <footer className="py-8 bg-primary text-primary-foreground">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0 hover-lift">
              <Image
                src="/logo-white.png"
                alt="Propure Logo"
                width={250}
                height={50}
                className="object-cover"
              />
              <span className="text-3xl font-bold font-heading">Propure</span>
            </div>
            <div className="text-sm text-primary-foreground/60">
              © 2024 Propure. All Rights Reserved.
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a
                href="#"
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm hover-lift"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-primary-foreground/60 hover:text-primary-foreground transition-colors text-sm hover-lift"
              >
                Terms of Service
              </a>
            </div>
          </div>
          <div className="text-center mt-6 text-xs text-primary-foreground/40">
            Launching in Australia, 2025
          </div>
        </div>
      </footer>
    </div>
  );
}
