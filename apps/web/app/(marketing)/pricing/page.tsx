"use client";

import { useState, useEffect, useRef } from "react";
import { Check, X, ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Footer from "@/components/main/Footer";
import Header from "@/components/main/Header";

// Custom hook for scroll reveal animation
function useScrollReveal() {
      useEffect(() => {
            const observerOptions = {
                  threshold: 0.1,
                  rootMargin: "0px 0px -50px 0px",
            };

            const observer = new IntersectionObserver((entries) => {
                  entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                              entry.target.classList.add("active");
                              observer.unobserve(entry.target);
                        }
                  });
            }, observerOptions);

            const revealElements = document.querySelectorAll(".reveal");
            revealElements.forEach((el) => observer.observe(el));

            return () => {
                  revealElements.forEach((el) => observer.unobserve(el));
            };
      }, []);
}

// Pricing Plans Data
const pricingPlans = [
      {
            name: "Starter",
            price: "$0",
            period: "Forever Free",
            features: [
                  "AI Strategy Discovery",
                  "3 Property Views / Month",
                  "Basic Market Data",
                  "Standard Support",
            ],
            cta: "Start Free",
            popular: false,
            enterprise: false,
      },
      {
            name: "Growth",
            price: "$29",
            period: "Per Month",
            features: [
                  "Everything in Starter",
                  "Unlimited Property Searches",
                  "Advanced Financial Modeling",
                  "Deep-Dive Analysis Reports",
                  "Property Comparison Tools",
                  "Priority Email Support",
            ],
            cta: "Start 14-Day Trial",
            popular: true,
            enterprise: false,
      },
      {
            name: "Professional",
            price: "$99",
            period: "Per Month",
            features: [
                  "Everything in Growth",
                  "Multi-Strategy Portfolio Analysis",
                  "Advanced Risk Modeling",
                  "Unlimited Property Comparisons",
                  "Tax Optimization Scenarios",
                  "White-Label Reports",
                  "API Access",
            ],
            cta: "Start Professional",
            popular: false,
            enterprise: false,
      },
      {
            name: "Enterprise",
            price: "Custom",
            period: "Tailored Solution",
            features: [
                  "Everything in Professional",
                  "Custom Data Integrations",
                  "Dedicated Infrastructure",
                  "SLA Guarantees",
                  "Team Collaboration Features",
            ],
            cta: "Contact Sales",
            popular: false,
            enterprise: true,
      },
];

// Comparison Table Data
const comparisonFeatures = [
      {
            feature: "AI Strategy Discovery",
            starter: true,
            growth: true,
            pro: true,
            enterprise: true,
      },
      {
            feature: "Property Searches (Monthly)",
            starter: "3",
            growth: "Unlimited",
            pro: "Unlimited",
            enterprise: "Unlimited",
      },
      {
            feature: "Financial Modeling",
            starter: "Basic",
            growth: "Advanced",
            pro: "Premium",
            enterprise: "Custom",
      },
      {
            feature: "Deep-Dive Reports",
            starter: "3 / Month",
            growth: "Unlimited",
            pro: "Unlimited",
            enterprise: "Unlimited",
      },
      {
            feature: "API Access",
            starter: false,
            growth: false,
            pro: true,
            enterprise: true,
      },
      {
            feature: "White-Labeling",
            starter: false,
            growth: false,
            pro: true,
            enterprise: true,
      },
      {
            feature: "Support",
            starter: "Standard Email",
            growth: "Priority Email",
            pro: "Dedicated Manager",
            enterprise: "Dedicated Agent",
      },
];

// FAQ Data
const faqItems = [
      {
            question: "Can I change my plan later?",
            answer:
                  "Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account settings.",
      },
      {
            question: 'Is the "Starter" plan really free?',
            answer:
                  "Yes, the Starter plan is free forever with no credit card required. It provides access to core AI strategy discovery tools.",
      },
      {
            question: "Do you offer refunds?",
            answer:
                  "We offer a 14-day money-back guarantee on all paid plans if you are not satisfied with our service.",
      },
      {
            question: "What payment methods do you accept?",
            answer:
                  "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal.",
      },
];

// Pricing Card Component
function PricingCard({
      plan,
      index,
}: {
      plan: (typeof pricingPlans)[0];
      index: number;
}) {
      return (
            <div
                  className={cn(
                        "group relative flex min-h-[500px] flex-col justify-between overflow-hidden border border-grid-20 bg-white p-10 transition-all duration-500",
                        "hover:-translate-y-2.5 hover:border-primary hover:shadow-[0_20px_40px_rgba(20,184,166,0.08)]",
                        plan.enterprise &&
                        "border-secondary bg-secondary text-white hover:shadow-[0_20px_40px_rgba(10,25,47,0.2)]",
                        "animate-fade-in"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
            >
                  {/* Top Border Animation */}
                  <div className="absolute left-0 top-0 h-[3px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />

                  {/* Popular Badge */}
                  {plan.popular && (
                        <div className="absolute right-0 top-0 bg-primary px-3 py-1 font-mono text-[10px] font-bold text-white">
                              MOST POPULAR
                        </div>
                  )}

                  {/* Header */}
                  <div
                        className={cn(
                              "mb-6 border-b border-grid-20 pb-6",
                              plan.enterprise && "border-white/20"
                        )}
                  >
                        <div
                              className={cn(
                                    "font-mono text-xs uppercase tracking-widest text-grid",
                                    plan.popular && "text-primary",
                                    plan.enterprise && "text-white/70"
                              )}
                        >
                              {plan.name}
                        </div>
                        <div
                              className={cn(
                                    "mt-2.5 font-head text-5xl font-bold leading-none text-primary",
                                    plan.enterprise && "text-4xl text-white"
                              )}
                        >
                              {plan.price}
                        </div>
                        <div
                              className={cn(
                                    "font-mono text-sm text-grid-20",
                                    plan.enterprise && "text-white/60"
                              )}
                        >
                              {plan.period}
                        </div>
                  </div>

                  {/* Features */}
                  <ul
                        className={cn(
                              "mb-8 flex-grow space-y-3",
                              plan.enterprise && "text-white/80"
                        )}
                  >
                        {plan.features.map((feature, i) => (
                              <li key={i} className="relative pl-6 text-[15px] text-grid">
                                    <span
                                          className={cn(
                                                "absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-grid-20 transition-colors duration-300 group-hover:bg-primary",
                                                plan.enterprise && "bg-white/40 group-hover:bg-white"
                                          )}
                                    />
                                    <span className={plan.enterprise ? "text-white/80" : ""}>
                                          {feature}
                                    </span>
                              </li>
                        ))}
                  </ul>

                  {/* CTA Button */}
                  <div className="w-full">
                        <button
                              className={cn(
                                    "btn w-full text-center",
                                    plan.popular && "btn-solid",
                                    plan.enterprise &&
                                    "border-white text-white hover:bg-white hover:text-secondary"
                              )}
                        >
                              {plan.cta}
                        </button>
                  </div>
            </div>
      );
}

// Comparison Table Cell Component
function TableCell({
      value,
      isEnterprise = false,
}: {
      value: boolean | string;
      isEnterprise?: boolean;
}) {
      if (typeof value === "boolean") {
            return value ? (
                  <Check className="h-5 w-5 text-primary" />
            ) : (
                  <X className="h-5 w-5 text-coral opacity-60" />
            );
      }
      return <span>{value}</span>;
}

// FAQ Item Component
function FAQItem({
      item,
      isActive,
      onClick,
}: {
      item: (typeof faqItems)[0];
      isActive: boolean;
      onClick: () => void;
}) {
      return (
            <div
                  className={cn(
                        "cursor-pointer border-b border-grid-20 transition-colors duration-200",
                        "hover:bg-primary/[0.03]"
                  )}
                  onClick={onClick}
            >
                  <div className="flex items-center justify-between py-6">
                        <span className="font-head text-lg font-semibold">{item.question}</span>
                        <ChevronDown
                              className={cn(
                                    "h-5 w-5 transition-transform duration-300",
                                    isActive && "rotate-180 text-primary"
                              )}
                        />
                  </div>
                  <div
                        className={cn(
                              "overflow-hidden transition-all duration-400",
                              isActive ? "max-h-[200px] pb-6" : "max-h-0"
                        )}
                  >
                        <p className="text-grid">{item.answer}</p>
                  </div>
            </div>
      );
}

// Navigation Link Component
function NavLink({
      href,
      children,
      active = false,
}: {
      href: string;
      children: React.ReactNode;
      active?: boolean;
}) {
      return (
            <Link
                  href={href}
                  className={cn(
                        "font-mono text-[11px] uppercase tracking-widest text-grid relative py-1 hover:text-primary transition-colors group",
                        active && "text-primary"
                  )}
            >
                  {children}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all group-hover:w-full" />
            </Link>
      );
}

// Header Component
// function PricingHeader() {
//       const [scrolled, setScrolled] = useState(false);
//       const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//       // Handle scroll effect
//       useEffect(() => {
//             const handleScroll = () => {
//                   setScrolled(window.scrollY > 50);
//             };
//             window.addEventListener("scroll", handleScroll);
//             return () => window.removeEventListener("scroll", handleScroll);
//       }, []);

//       return (
//             <header
//                   className={cn(
//                         "fixed top-0 left-0 right-0 h-20 bg-paper/85 backdrop-blur-[12px] border-b border-grid-20 flex items-center justify-between px-10 z-[1000] transition-all duration-300",
//                         scrolled && "h-[70px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
//                   )}
//             >
//                   <Link href="/" className="flex items-center gap-4 cursor-pointer">
//                         <div className="w-10 h-10 bg-secondary border border-primary flex items-center justify-center transition-transform hover:rotate-[10deg] hover:scale-105">
//                               <Layers className="text-primary" size={16} />
//                         </div>
//                         <span className="font-head font-bold text-2xl text-secondary">
//                               Propure
//                         </span>
//                   </Link>

//                   <nav className="hidden lg:flex gap-12">
//                         <NavLink href="/">Home</NavLink>
//                         <NavLink href="/pricing" active>
//                               Pricing
//                         </NavLink>
//                         <NavLink href="/about-us">About Us</NavLink>
//                         <NavLink href="/contact-us">Contact Us</NavLink>
//                   </nav>

//                   <div className="hidden md:flex gap-4">
//                         <button className="btn">Login</button>
//                         <button className="btn btn-solid">Get Access</button>
//                   </div>

//                   {/* Mobile Menu Toggle */}
//                   <button
//                         className="lg:hidden flex flex-col justify-center items-center w-8 h-8"
//                         onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                   >
//                         <span
//                               className={cn(
//                                     "w-[30px] h-[2px] bg-secondary transition-all duration-300",
//                                     mobileMenuOpen && "rotate-45 translate-y-[6px] bg-primary"
//                               )}
//                         />
//                         <span
//                               className={cn(
//                                     "w-[30px] h-[2px] bg-secondary my-[4px] transition-all duration-300",
//                                     mobileMenuOpen && "opacity-0"
//                               )}
//                         />
//                         <span
//                               className={cn(
//                                     "w-[30px] h-[2px] bg-secondary transition-all duration-300",
//                                     mobileMenuOpen && "-rotate-45 -translate-y-[6px] bg-primary"
//                               )}
//                         />
//                   </button>

//                   {/* Mobile Menu */}
//                   {mobileMenuOpen && (
//                         <div className="fixed inset-0 top-20 bg-paper z-[999] flex flex-col items-center justify-center gap-10 lg:hidden">
//                               <NavLink href="/">Home</NavLink>
//                               <NavLink href="/pricing" active>
//                                     Pricing
//                               </NavLink>
//                               <NavLink href="/about-us">About Us</NavLink>
//                               <NavLink href="/contact-us">Contact Us</NavLink>
//                               <div className="flex gap-4 mt-8">
//                                     <button className="btn">Login</button>
//                                     <button className="btn btn-solid">Get Access</button>
//                               </div>
//                         </div>
//                   )}
//             </header>
//       );
// }

// Footer Component
// function PricingFooter() {
//   return (
//     <footer className="bg-white border-t border-grid-20 px-[5vw] py-20">
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
//         {/* Brand */}
//         <div>
//           <Link href="/" className="flex items-center gap-4 mb-6">
//             <div className="w-8 h-8 bg-secondary border border-primary flex items-center justify-center">
//               <Layers className="text-primary" size={14} />
//             </div>
//             <span className="font-head font-bold text-xl text-secondary">
//               Propure
//             </span>
//           </Link>
//           <p className="mono-sub">
//             AI-powered property investment insights for smarter decisions.
//           </p>
//         </div>

//         {/* Product Links */}
//         <div>
//           <h5 className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-6">
//             Product
//           </h5>
//           <ul className="space-y-3">
//             <li>
//               <Link
//                 href="/"
//                 className="text-grid text-[15px] hover:text-primary hover:pl-1 transition-all"
//               >
//                 Features
//               </Link>
//             </li>
//             <li>
//               <Link
//                 href="/pricing"
//                 className="text-grid text-[15px] hover:text-primary hover:pl-1 transition-all"
//               >
//                 Pricing
//               </Link>
//             </li>
//             <li>
//               <Link
//                 href="/"
//                 className="text-grid text-[15px] hover:text-primary hover:pl-1 transition-all"
//               >
//                 API
//               </Link>
//             </li>
//           </ul>
//         </div>

//         {/* Company Links */}
//         <div>
//           <h5 className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-6">
//             Company
//           </h5>
//           <ul className="space-y-3">
//             <li>
//               <Link
//                 href="/about-us"
//                 className="text-grid text-[15px] hover:text-primary hover:pl-1 transition-all"
//               >
//                 About
//               </Link>
//             </li>
//             <li>
//               <Link
//                 href="/"
//                 className="text-grid text-[15px] hover:text-primary hover:pl-1 transition-all"
//               >
//                 Careers
//               </Link>
//             </li>
//             <li>
//               <Link
//                 href="/"
//                 className="text-grid text-[15px] hover:text-primary hover:pl-1 transition-all"
//               >
//                 Legal
//               </Link>
//             </li>
//           </ul>
//         </div>

//         {/* Connect Links */}
//         <div>
//           <h5 className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-6">
//             Connect
//           </h5>
//           <ul className="space-y-3">
//             <li>
//               <Link
//                 href="/contact-us"
//                 className="text-grid text-[15px] hover:text-primary hover:pl-1 transition-all"
//               >
//                 Contact
//               </Link>
//             </li>
//             <li>
//               <Link
//                 href="/"
//                 className="text-grid text-[15px] hover:text-primary hover:pl-1 transition-all"
//               >
//                 Twitter
//               </Link>
//             </li>
//             <li>
//               <Link
//                 href="/"
//                 className="text-grid text-[15px] hover:text-primary hover:pl-1 transition-all"
//               >
//                 LinkedIn
//               </Link>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Copyright */}
//       <div className="mt-[60px] pt-6 border-t border-grid-20 text-center font-mono text-[10px] uppercase text-grid-20">
//         &copy; {new Date().getFullYear()} Propure Systems.
//       </div>
//     </footer>
//   );
// }

// Background Orbs Component
function BackgroundOrbs() {
      return (
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                  <div className="absolute w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px] opacity-40 -top-[10%] -left-[10%] animate-[float_20s_infinite_ease-in-out]" />
                  <div className="absolute w-[300px] h-[300px] rounded-full bg-secondary/5 blur-[80px] opacity-40 bottom-[10%] -right-[5%] animate-[float_20s_infinite_ease-in-out_-5s]" />
                  <div className="absolute w-[200px] h-[200px] rounded-full bg-mint/10 blur-[80px] opacity-40 top-[40%] left-[60%] animate-[float_20s_infinite_ease-in-out_-10s]" />
            </div>
      );
}

// Scroll Progress Bar Component
// function ScrollProgress() {
//       const [progress, setProgress] = useState(0);

//       useEffect(() => {
//             const handleScroll = () => {
//                   const winScroll =
//                         document.body.scrollTop || document.documentElement.scrollTop;
//                   const height =
//                         document.documentElement.scrollHeight -
//                         document.documentElement.clientHeight;
//                   const scrolled = (winScroll / height) * 100;
//                   setProgress(scrolled);
//             };
//             window.addEventListener("scroll", handleScroll);
//             return () => window.removeEventListener("scroll", handleScroll);
//       }, []);

//       return (
//             <div
//                   className="fixed top-0 left-0 h-[2px] bg-primary z-[2000] transition-[width]"
//                   style={{ width: `${progress}%` }}
//             />
//       );
// }

export default function PricingPage() {
      const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

      // Initialize scroll reveal animation
      useScrollReveal();

      return (
            <>
                  {/* Scroll Progress Bar */}
                  {/* <ScrollProgress /> */}

                  {/* Background Orbs */}
                  <BackgroundOrbs />

                  {/* Header */}
                  {/* <PricingHeader /> */}
                  <Header path={"/pricing"} />

                  <main className="min-h-screen">
                        {/* Hero Section */}
                        <section className="flex min-h-[70vh] flex-col items-center justify-center border-b border-grid-20 px-5 pb-[120px] pt-[180px] text-center">
                              <div className="reveal">
                                    {/* Status Badge */}
                                    <div className="mb-6 inline-flex items-center gap-2.5 border border-[rgba(26,60,43,0.2)] px-3 py-1">
                                          <div className="h-2 w-2 rounded-full bg-[#1A3C2B]" />
                                          <span className="font-mono text-[10px] uppercase tracking-wider">
                                                SYSTEM OPERATIONAL
                                          </span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="display-text mb-4 text-[4rem] !leading-tight !tracking-[-0.03em] max-md:text-4xl">
                                          CHOOSE YOUR INVESTMENT PLAN
                                    </h1>

                                    {/* Subtitle */}
                                    <p className="mx-auto max-w-[600px] font-mono text-sm text-grid opacity-90">
                                          Unlock the full power of Propure&apos;s AI-driven property
                                          intelligence. Flexible plans designed for every stage of your
                                          investment journey.
                                    </p>
                              </div>
                        </section>

                        {/* Pricing Section */}
                        <section className="border-b border-grid-20 px-[5vw] py-20">
                              {/* Section Header */}
                              <div className="reveal mb-[60px] flex items-baseline gap-5">
                                    <h2 className="display-text text-5xl max-md:text-4xl">TIERS</h2>
                                    <span className="rounded-full border border-grid-20 px-3 py-1 font-mono text-xs text-primary">
                                          PRICING STRUCTURE
                                    </span>
                              </div>

                              {/* Pricing Grid */}
                              <div className="mb-[60px] grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                                    {pricingPlans.map((plan, index) => (
                                          <div
                                                key={plan.name}
                                                className={cn(
                                                      "reveal",
                                                      index === 1 && "reveal-delay-1",
                                                      index === 2 && "reveal-delay-2",
                                                      index === 3 && "reveal-delay-3"
                                                )}
                                          >
                                                <PricingCard plan={plan} index={index} />
                                          </div>
                                    ))}
                              </div>
                        </section>

                        {/* Comparison Table Section */}
                        <section className="border-b border-grid-20 px-[5vw] py-20">
                              {/* Section Header */}
                              <div className="reveal mb-[60px] flex items-baseline gap-5">
                                    <h2 className="display-text text-5xl max-md:text-4xl">
                                          FEATURE COMPARISON
                                    </h2>
                                    <span className="rounded-full border border-grid-20 px-3 py-1 font-mono text-xs text-primary">
                                          DETAILED BREAKDOWN
                                    </span>
                              </div>

                              {/* Table */}
                              <div className="reveal overflow-x-auto shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                                    <table className="w-full border-collapse font-mono text-[13px]">
                                          <thead>
                                                <tr>
                                                      <th className="border border-grid-20 bg-paper p-5 text-left text-[11px] font-bold uppercase tracking-widest text-secondary">
                                                            Feature
                                                      </th>
                                                      <th className="border border-grid-20 bg-paper p-5 text-left text-[11px] font-bold uppercase tracking-widest text-secondary">
                                                            Starter
                                                      </th>
                                                      <th className="border border-grid-20 bg-paper p-5 text-left text-[11px] font-bold uppercase tracking-widest text-secondary">
                                                            Growth
                                                      </th>
                                                      <th className="border border-grid-20 bg-paper p-5 text-left text-[11px] font-bold uppercase tracking-widest text-secondary">
                                                            Pro
                                                      </th>
                                                      <th className="border border-grid-20 bg-paper p-5 text-left text-[11px] font-bold uppercase tracking-widest text-secondary">
                                                            Enterprise
                                                      </th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {comparisonFeatures.map((row, index) => (
                                                      <tr key={index} className="transition-colors hover:bg-paper/50">
                                                            <td className="w-1/4 border border-grid-20 bg-white p-5 font-bold text-secondary">
                                                                  {row.feature}
                                                            </td>
                                                            <td className="border border-grid-20 bg-white p-5 text-grid">
                                                                  <TableCell value={row.starter} />
                                                            </td>
                                                            <td className="border border-grid-20 bg-white p-5 text-grid">
                                                                  <TableCell value={row.growth} />
                                                            </td>
                                                            <td className="border border-grid-20 bg-white p-5 text-grid">
                                                                  <TableCell value={row.pro} />
                                                            </td>
                                                            <td className="border border-grid-20 bg-white p-5 text-grid">
                                                                  <TableCell value={row.enterprise} isEnterprise />
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
                        </section>

                        {/* FAQ Section */}
                        <section className="px-[5vw] py-20">
                              {/* Section Header */}
                              <div className="reveal mb-[60px] flex items-baseline justify-center gap-5">
                                    <h2 className="display-text text-5xl max-md:text-4xl">
                                          COMMON QUESTIONS
                                    </h2>
                              </div>

                              {/* FAQ Items */}
                              <div className="mx-auto max-w-[800px]">
                                    {faqItems.map((item, index) => (
                                          <div
                                                key={index}
                                                className={cn(
                                                      "reveal",
                                                      index === 1 && "reveal-delay-1",
                                                      index === 2 && "reveal-delay-2",
                                                      index === 3 && "reveal-delay-3"
                                                )}
                                          >
                                                <FAQItem
                                                      item={item}
                                                      isActive={activeAccordion === index}
                                                      onClick={() =>
                                                            setActiveAccordion(activeAccordion === index ? null : index)
                                                      }
                                                />
                                          </div>
                                    ))}
                              </div>
                        </section>

                        {/* CTA Section */}
                        <section className="border-b border-grid-20 px-5 py-[120px] text-center">
                              <div className="reveal relative mx-auto inline-block w-full max-w-[600px] border border-grid-20 bg-paper px-10 py-[60px]">
                                    {/* Corner Decorations */}
                                    <div className="absolute left-0 top-0 h-2.5 w-2.5 border-l-2 border-t-2 border-primary" />
                                    <div className="absolute right-0 top-0 h-2.5 w-2.5 border-r-2 border-t-2 border-primary" />
                                    <div className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-primary" />
                                    <div className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-primary" />

                                    <h3 className="display-text mb-6 text-[32px]">READY TO START?</h3>
                                    <p className="mono-sub mb-8">
                                          Join the future of property investment today.
                                    </p>
                                    <button className="btn btn-solid px-10 py-4 text-xs">
                                          GET STARTED NOW
                                    </button>
                              </div>
                        </section>
                  </main>

                  {/* Footer */}
                  <Footer />
            </>
      );
}
