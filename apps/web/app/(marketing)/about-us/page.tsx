"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Header from "@/components/main/Header";
import Footer from "@/components/main/Footer";

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

// Story/Mission Data
const foundationCards = [
  {
    label: "Origin Story",
    labelColor: "border-primary text-primary",
    title: "Founded in 2023",
    description:
      "Born out of frustration with fragmented property data, Propure set out to build a single source of truth for Australian investors.",
  },
  {
    label: "The Mission",
    labelColor: "border-mint text-mint",
    title: "Accessibility First",
    description:
      "To make professional-grade investment tools accessible to everyone, not just institutional buyers.",
  },
  {
    label: "Core Philosophy",
    labelColor: "border-gold text-gold",
    title: "Data Before Property",
    description:
      "We believe strategy should drive selection, ensuring every investment is backed by rigorous statistical analysis.",
  },
];

// Values Data
const valuesCards = [
  {
    label: "Transparency",
    labelColor: "border-primary text-primary",
    title: "Open Source Methodology",
    description:
      "We clearly define our data sources and algorithms so you know exactly how insights are derived.",
  },
  {
    label: "Accuracy",
    labelColor: "border-mint text-mint",
    title: "Relentless Validation",
    description:
      "Our AI is constantly tested against real-world outcomes to maintain a high prediction accuracy.",
  },
  {
    label: "User Empathy",
    labelColor: "border-coral text-coral",
    title: "Human-Centric Design",
    description:
      "We build tools for humans, using natural language to bridge the gap between complex data and clear decisions.",
  },
];

// Team Data
const teamMembers = [
  {
    name: "Jane Doe",
    role: "CEO / FOUNDER",
    description: "Former Data Architect at Big 4 Firm.",
    image: "https://picsum.photos/seed/ceo/200/200",
    buttonVariant: "solid" as const,
  },
  {
    name: "Alex Rivera",
    role: "CTO / HEAD OF ENGINEERING",
    description: "Expert in Large Language Models & Fintech.",
    image: "https://picsum.photos/seed/cto/200/200",
    buttonVariant: "outline" as const,
  },
  {
    name: "Sarah Kim",
    role: "CHIEF PRODUCT OFFICER",
    description: "Specialist in Real Estate User Experience.",
    image: "https://picsum.photos/seed/cpo/200/200",
    buttonVariant: "outline" as const,
  },
];

// Background Orbs Component
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px] opacity-40 -top-[10%] -left-[10%] animate-float" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-secondary/5 blur-[80px] opacity-40 bottom-[10%] -right-[5%] animate-float [animation-delay:-5s]" />
      <div className="absolute w-[200px] h-[200px] rounded-full bg-mint/10 blur-[80px] opacity-40 top-[40%] left-[60%] animate-float [animation-delay:-10s]" />
    </div>
  );
}

// Scroll Progress Bar Component
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const winScroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setProgress(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-[2px] bg-primary z-[2000] transition-[width]"
      style={{ width: `${progress}%` }}
    />
  );
}

// Bento Cell Component
function BentoCell({
  label,
  labelColor,
  title,
  description,
  className,
  children,
}: {
  label?: string;
  labelColor?: string;
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group relative bg-white p-10 border border-grid-20 flex flex-col justify-between min-h-[320px] transition-all duration-500",
        "hover:-translate-y-2 hover:border-primary hover:shadow-[0_20px_40px_rgba(20,184,166,0.08)]",
        "overflow-hidden",
        className
      )}
    >
      {/* Top Border Animation */}
      <div className="absolute left-0 top-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />

      {children ? (
        children
      ) : (
        <>
          {label && (
            <div
              className={cn(
                "font-mono text-[11px] uppercase tracking-widest pl-4 border-l-[3px] mb-6 inline-block",
                labelColor
              )}
            >
              {label}
            </div>
          )}
          {title && (
            <h3 className="font-head text-2xl font-semibold text-secondary mb-4 leading-tight">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[15px] text-grid mb-5">{description}</p>
          )}
        </>
      )}
    </div>
  );
}

// Team Card Component
function TeamCard({
  member,
  className,
}: {
  member: (typeof teamMembers)[0];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative bg-white p-10 border border-grid-20 flex flex-col items-center justify-center text-center min-h-[320px] transition-all duration-500",
        "hover:-translate-y-2 hover:border-primary hover:shadow-[0_20px_40px_rgba(20,184,166,0.08)]",
        "overflow-hidden",
        className
      )}
    >
      {/* Top Border Animation */}
      <div className="absolute left-0 top-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />

      {/* Avatar */}
      <div className="w-[100px] h-[100px] rounded-full overflow-hidden mb-6 border border-grid-20">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover grayscale mix-blend-luminosity transition-all duration-300 group-hover:grayscale-0 group-hover:mix-blend-normal"
        />
      </div>

      {/* Role */}
      <div className="font-mono text-xs text-primary mb-2">{member.role}</div>

      {/* Name */}
      <h3 className="font-head text-2xl font-semibold text-secondary mb-4">
        {member.name}
      </h3>

      {/* Description */}
      <p className="mono-sub mb-4">{member.description}</p>

      {/* Button */}
      <button
        className={cn(
          "btn text-[10px] px-4 py-2",
          member.buttonVariant === "solid" && "btn-solid"
        )}
      >
        View Profile
      </button>
    </div>
  );
}

export default function AboutUsPage() {
  // Initialize scroll reveal animation
  useScrollReveal();

  return (
    <>
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Background Orbs */}
      <BackgroundOrbs />

      {/* Header */}
      <Header path={"/about-us"} />

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="pt-[180px] pb-[120px] min-h-[90vh] grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-[60px] items-center border-b border-grid-20 px-[5vw]">
          {/* Hero Content */}
          <div className="reveal lg:text-left text-center">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 border border-grid-20 bg-white mb-8 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.03)]">
              <div className="w-2 h-2 bg-mint rounded-full shadow-[0_0_8px_#9EFFBF]" />
              <span className="font-mono text-[11px] uppercase tracking-widest">
                Team Operational
              </span>
            </div>

            {/* Title */}
            <h1 className="display-text text-[72px] mb-8 leading-none tracking-[-0.03em] max-lg:text-5xl">
              THE ARCHITECTS OF DATA
            </h1>

            {/* Subtitle */}
            <div className="font-mono text-sm text-grid border-l-2 border-primary pl-5 mb-10 leading-relaxed opacity-90 max-lg:border-l-0 max-lg:border-b-2 max-lg:pl-0 max-lg:pb-2.5 max-lg:inline-block">
              Propure was born from the desire to{" "}
              <span className="text-primary font-semibold bg-primary/10 px-1">
                democratize advanced analytics
              </span>{" "}
              for real estate investing. We combine AI, trusted data, and human
              insight to craft strategies that align with your goals.
            </div>
          </div>

          {/* Hero Visual - Orbit Circle */}
          <div className="reveal relative h-[500px] border border-grid-20 p-5 flex flex-col justify-center items-center bg-white/50 max-lg:hidden">
            <div className="w-full h-full border border-dashed border-grid-20 relative overflow-hidden">
              {/* Orbit Circle */}
              <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] border border-grid-20 rounded-full animate-orbit">
                {/* Orbit Node */}
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-primary -translate-x-1/2 rounded-full shadow-[0_0_10px_#14b8a6]" />
              </div>
              {/* Center Image */}
              <img
                src="https://picsum.photos/seed/team/600/500"
                alt="Collaboration"
                className="absolute w-[220px] h-[160px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 object-cover mix-blend-luminosity opacity-90 border border-secondary transition-all duration-500 hover:mix-blend-normal hover:opacity-100 hover:scale-105"
              />
            </div>
          </div>
        </section>

        {/* Story & Mission Section */}
        <section className="py-[100px] px-[5vw] border-b border-grid-20">
          {/* Section Header */}
          <div className="reveal mb-[60px] flex items-baseline gap-5">
            <h2 className="display-text text-[56px] tracking-[-0.02em] max-md:text-4xl">
              OUR FOUNDATION
            </h2>
            <span className="rounded-full border border-grid-20 px-3 py-1 font-mono text-xs text-primary">
              THE PROTOCOL
            </span>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foundationCards.map((card, index) => (
              <div
                key={card.label}
                className={cn(
                  "reveal",
                  index === 1 && "reveal-delay-1",
                  index === 2 && "reveal-delay-2"
                )}
              >
                <BentoCell
                  label={card.label}
                  labelColor={card.labelColor}
                  title={card.title}
                  description={card.description}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-[100px] px-[5vw] border-b border-grid-20">
          {/* Section Header */}
          <div className="reveal mb-[60px] flex items-baseline gap-5">
            <h2 className="display-text text-[56px] tracking-[-0.02em] max-md:text-4xl">
              SYSTEM VALUES
            </h2>
            <span className="rounded-full border border-grid-20 px-3 py-1 font-mono text-xs text-primary">
              INTEGRITY & TRUST
            </span>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valuesCards.map((card, index) => (
              <div
                key={card.label}
                className={cn(
                  "reveal",
                  index === 1 && "reveal-delay-1",
                  index === 2 && "reveal-delay-2"
                )}
              >
                <BentoCell
                  label={card.label}
                  labelColor={card.labelColor}
                  title={card.title}
                  description={card.description}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="py-[100px] px-[5vw] border-b border-grid-20">
          {/* Section Header */}
          <div className="reveal mb-[60px] flex items-baseline gap-5">
            <h2 className="display-text text-[56px] tracking-[-0.02em] max-md:text-4xl">
              THE NODES
            </h2>
            <span className="rounded-full border border-grid-20 px-3 py-1 font-mono text-xs text-primary">
              MEET THE TEAM
            </span>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className={cn(
                  "reveal",
                  index === 1 && "reveal-delay-1",
                  index === 2 && "reveal-delay-2"
                )}
              >
                <TeamCard member={member} />
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

            <h3 className="display-text mb-6 text-[32px]">JOIN THE MISSION</h3>
            <p className="mono-sub mb-8">
              Become part of the future of property investment.
            </p>
            <button className="btn btn-solid px-10 py-4 text-xs">
              VIEW OPEN ROLES
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
