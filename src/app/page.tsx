"use client";

import { AnimatePresence, motion, useInView, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import content from "@/data/content.json";

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay: i * 0.1 },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ─── Reusable Section Wrapper ─── */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <section ref={ref} id={id} className={className}>
      <motion.div
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={fadeIn}
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ─── Section Label ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-4">
      {children}
    </span>
  );
}

/* ─── 3D Tilt Card ─── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: "transform 0.15s ease-out" }}
    >
      {children}
    </div>
  );
}

/* ─── Animated Counter ─── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  if (inView && count === 0) {
    let start = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
  }

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ═══════════════════════════════════════
   STICKY CTA BAR
   ═══════════════════════════════════════ */
function StickyCTA() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [600, 800], [0, 1]);
  const pointerEvents = useTransform(scrollY, (v) => (v > 800 ? "auto" : "none"));

  return (
    <motion.div
      style={{ opacity, pointerEvents }}
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/90 py-3 backdrop-blur-md md:hidden"
    >
      <div className="flex items-center justify-between px-4">
        <div>
          <p className="text-[13px] font-semibold text-stone-900">{content.sticky_cta.title}</p>
          <p className="text-[11px] text-stone-500">{content.sticky_cta.subtitle}</p>
        </div>
        <a
          href="#contact"
          className="rounded-full bg-accent px-5 py-3 text-[13px] font-semibold text-white"
        >
          {content.sticky_cta.button}
        </a>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════ */
function Navigation() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        backgroundColor: `rgba(250, 250, 248, ${bgOpacity})`,
        backdropFilter: "blur(12px)",
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-12">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <span className="font-serif text-lg text-white italic">{content.company.logo_initial}</span>
          </div>
          <div className="leading-tight">
            <span className="text-[15px] font-semibold tracking-tight text-stone-900">
              {content.company.name.split(" ")[0]}
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.15em] text-stone-400">
              {content.company.logo_subtitle}
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-10 md:flex">
          {content.nav.items.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-[13px] font-medium tracking-wide text-stone-500 transition-colors hover:text-stone-900"
            >
              {item}
            </a>
          ))}
          <a
            href="#contact"
            className="rounded-full bg-accent px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20"
          >
            {content.nav.cta}
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block h-[2px] w-6 bg-stone-900"
          />
          <motion.span
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            className="block h-[2px] w-6 bg-stone-900"
          />
          <motion.span
            animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block h-[2px] w-6 bg-stone-900"
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={open ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        className="overflow-hidden bg-warm-white md:hidden"
      >
        <div className="flex flex-col gap-4 px-6 pb-8 pt-2">
          {content.nav.items.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => setOpen(false)}
              className="py-2 text-[15px] font-medium text-stone-700"
            >
              {item}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-accent px-6 py-3 text-center text-[14px] font-semibold text-white"
          >
            {content.nav.cta}
          </a>
        </div>
      </motion.div>
    </motion.header>
  );
}

/* ═══════════════════════════════════════
   HERO
   ═══════════════════════════════════════ */
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-hidden pt-28 pb-20 lg:pt-40 lg:pb-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Left — Copy */}
          <div className="max-w-xl">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
              <SectionLabel>{content.hero.label}</SectionLabel>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="mt-2 font-serif text-[clamp(2.8rem,6vw,5rem)] font-normal leading-[1.05] tracking-tight text-stone-900"
            >
              {content.hero.headline_before}
              <br />
              {content.hero.headline_after}{" "}
              <em className="text-accent">{content.hero.emphasis}</em>.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mt-8 max-w-md text-[16px] leading-relaxed text-stone-500"
            >
              {content.hero.subheadline}
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <a
                href="#contact"
                className="group relative inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-[14px] font-semibold text-white transition-all hover:bg-accent-light hover:shadow-xl hover:shadow-accent/20"
              >
                {content.hero.cta_primary}
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#diensten"
                className="text-[14px] font-medium text-stone-500 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-900 hover:decoration-stone-500"
              >
                {content.hero.cta_secondary}
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-stone-200 pt-8 sm:gap-8"
            >
              {content.hero.badges.map((badge, i) => (
                <>
                  {i > 0 && <div key={`divider-${i}`} className="hidden h-10 w-px bg-stone-200 sm:block" />}
                  <div key={badge.label}>
                    <span className="block font-serif text-3xl text-stone-900 italic">{badge.value}</span>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                      {badge.label}
                    </span>
                  </div>
                </>
              ))}
            </motion.div>
          </div>

          {/* Right — Hero Image */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <motion.div style={{ y: imageY }} className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl lg:rounded-3xl">
                <Image
                  src={content.hero.image}
                  alt={content.hero.image_alt}
                  fill
                  className="object-cover img-reveal"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 to-transparent" />
              </div>

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -bottom-6 left-0 rounded-2xl bg-white p-4 shadow-2xl shadow-stone-900/10 sm:-left-6 sm:p-6 lg:-left-10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                    <svg className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                      {content.hero.floating_card_label}
                    </span>
                    <span className="block text-2xl font-semibold text-stone-900">{content.hero.floating_card_value}</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Background Gradient Orb */}
      <div className="absolute -top-40 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-accent/5 to-cream opacity-60 blur-3xl" />
    </section>
  );
}

/* ═══════════════════════════════════════
   TRUST BAR
   ═══════════════════════════════════════ */
function TrustBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="border-y border-stone-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">
            {content.trust.label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-14">
            {/* Google Reviews */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-[20px] font-bold tracking-tight text-stone-900">{content.trust.google_score}</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-3.5 w-3.5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-stone-400">{content.trust.google_count} beoordelingen</span>
            </div>
            <div className="hidden h-10 w-px bg-stone-200 sm:block" />
            {/* NOAB Logo */}
            <div className="group flex flex-col items-center gap-1 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <svg viewBox="0 0 80 32" className="h-8 w-20">
                <rect x="0" y="4" width="24" height="24" rx="4" fill="#003366"/>
                <text x="12" y="21" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui">N</text>
                <text x="30" y="22" fill="#003366" fontSize="14" fontWeight="800" fontFamily="system-ui" letterSpacing="1">OAB</text>
              </svg>
            </div>
            {/* SRA Logo */}
            <div className="group flex flex-col items-center gap-1 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
              <svg viewBox="0 0 60 32" className="h-8 w-16">
                <rect x="0" y="4" width="60" height="24" rx="4" fill="#1a5632"/>
                <text x="30" y="21" textAnchor="middle" fill="white" fontSize="14" fontWeight="700" fontFamily="system-ui" letterSpacing="2">SRA</text>
              </svg>
            </div>
            {/* NBA Logo */}
            <div className="hidden group flex-col items-center gap-1 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:flex">
              <svg viewBox="0 0 60 32" className="h-8 w-16">
                <circle cx="16" cy="16" r="12" fill="none" stroke="#004899" strokeWidth="2.5"/>
                <text x="16" y="20" textAnchor="middle" fill="#004899" fontSize="10" fontWeight="800" fontFamily="system-ui">NBA</text>
                <text x="44" y="14" fill="#004899" fontSize="7" fontWeight="600" fontFamily="system-ui">Koninklijke</text>
                <text x="44" y="22" fill="#004899" fontSize="7" fontWeight="600" fontFamily="system-ui">NBA</text>
              </svg>
            </div>
            {/* RB Logo */}
            <div className="hidden group flex-col items-center gap-1 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 sm:flex">
              <svg viewBox="0 0 50 32" className="h-8 w-14">
                <rect x="0" y="6" width="50" height="20" rx="3" fill="none" stroke="#8B1A1A" strokeWidth="2"/>
                <text x="25" y="21" textAnchor="middle" fill="#8B1A1A" fontSize="12" fontWeight="800" fontFamily="system-ui" letterSpacing="3">RB</text>
              </svg>
            </div>
            {/* Exact Online Logo */}
            <div className="hidden group flex-col items-center gap-1 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 lg:flex">
              <svg viewBox="0 0 100 32" className="h-8 w-24">
                <text x="0" y="22" fill="#e94d10" fontSize="18" fontWeight="700" fontFamily="system-ui">exact</text>
                <text x="62" y="22" fill="#333" fontSize="10" fontWeight="400" fontFamily="system-ui">online</text>
              </svg>
            </div>
            {/* Twinfield Logo */}
            <div className="hidden group flex-col items-center gap-1 opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0 lg:flex">
              <svg viewBox="0 0 100 32" className="h-8 w-24">
                <text x="0" y="22" fill="#00a1e0" fontSize="16" fontWeight="700" fontFamily="system-ui">twinfield</text>
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   SERVICES
   ═══════════════════════════════════════ */
const serviceIcons = [
  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>,
  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>,
  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>,
  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>,
  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>,
  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>,
];

const services = content.services.items.map((item, i) => ({
  icon: serviceIcons[i],
  title: item.title,
  description: item.description,
}));

function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="diensten" ref={ref} className="relative py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 max-w-2xl sm:mb-20">
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
            <SectionLabel>{content.services.label}</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={1}
            className="font-serif text-[clamp(2rem,4vw,3.5rem)] leading-[1.1] tracking-tight text-stone-900"
          >
            {content.services.headline_before}
            <br />
            <em className="text-accent">{content.services.headline_emphasis}</em>.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={2}
            className="mt-6 text-[16px] leading-relaxed text-stone-500"
          >
            {content.services.description}
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid gap-3 sm:gap-6">
          {/* Large cards row */}
          <div className="grid gap-3 sm:gap-6 md:grid-cols-2">
            {services.slice(0, 2).map((service, i) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                custom={i * 0.5}
              >
                <TiltCard className="group relative rounded-2xl border border-stone-200/60 bg-gradient-to-br from-accent/5 to-white p-8 transition-all duration-500 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5 sm:p-10 lg:p-12 h-full">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent/15 sm:h-16 sm:w-16">
                    {service.icon}
                  </div>
                  <h3 className="mb-3 text-[18px] font-semibold tracking-tight text-stone-900 sm:text-[22px]">
                    {service.title}
                  </h3>
                  <p className="text-[14px] leading-relaxed text-stone-500 sm:text-[15px]">
                    {service.description}
                  </p>
                  <a href="#contact" className="mt-6 flex items-center gap-2 text-[13px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                    Meer informatie
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </TiltCard>
              </motion.div>
            ))}
          </div>
          {/* Small cards row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {services.slice(2).map((service, i) => (
              <motion.div
                key={service.title}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                custom={(i + 2) * 0.5}
              >
                <TiltCard className="group relative rounded-2xl border border-stone-200/60 bg-white p-5 transition-all duration-500 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5 sm:p-6 h-full">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-stone-50 text-accent transition-colors group-hover:bg-accent/10 sm:h-12 sm:w-12">
                    {service.icon}
                  </div>
                  <h3 className="mb-2 text-[14px] font-semibold tracking-tight text-stone-900 sm:text-[16px]">
                    {service.title}
                  </h3>
                  <p className="hidden text-[13px] leading-relaxed text-stone-500 sm:block">
                    {service.description}
                  </p>
                  <a href="#contact" className="mt-4 flex items-center gap-2 text-[12px] font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100 sm:text-[13px]">
                    Meer informatie
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   INDUSTRIES
   ═══════════════════════════════════════ */
const industryIcons = [
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>,
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0a2.999 2.999 0 002.25-1.016A2.999 2.999 0 003 9.349z" />
  </svg>,
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>,
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
  </svg>,
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>,
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
  </svg>,
];

function Industries() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const industries = content.industries.map((item, i) => ({
    icon: industryIcons[i],
    name: item.name,
    desc: item.desc,
  }));

  return (
    <section ref={ref} className="bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-14 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
            <SectionLabel>{content.sections.sectoren}</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={1}
            className="mx-auto max-w-xl font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-tight text-stone-900"
          >
            {content.sections.sectoren_headline.split(' ').slice(0, -2).join(' ')} <em className="text-accent">{content.sections.sectoren_headline.split(' ').slice(-2).join(' ')}</em>.
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={i * 0.3}
              className="flex flex-col items-center gap-2 rounded-xl border border-stone-200/60 bg-white p-4 text-center transition-all hover:border-accent/20 hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-5 sm:text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent sm:h-12 sm:w-12">
                {ind.icon}
              </div>
              <div>
                <h3 className="text-[13px] font-semibold text-stone-900 sm:text-[15px]">{ind.name}</h3>
                <p className="hidden text-[13px] text-stone-500 sm:block">{ind.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   ABOUT / WHY STERLING
   ═══════════════════════════════════════ */
function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="over-ons" ref={ref} className="relative overflow-hidden py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Image Composition */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src={content.about.image}
                alt={content.about.image_alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            {/* Overlapping Accent Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute -bottom-8 right-0 rounded-2xl bg-accent p-6 text-white shadow-2xl sm:-right-4 sm:p-8 lg:-right-8"
            >
              <p className="font-serif text-4xl italic">{content.about.years_experience}</p>
              <p className="mt-1 text-[12px] font-medium uppercase tracking-wider text-white/70">
                Jaar
                <br />
                ervaring
              </p>
            </motion.div>
          </motion.div>

          {/* Copy */}
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
              <SectionLabel>{content.about.label}</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={1}
              className="font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-tight text-stone-900"
              dangerouslySetInnerHTML={{
                __html: content.about.headline
                  .replace(/\n/g, '<br />')
                  .replace(/Altijd bereikbaar/g, '<em class="text-accent">Altijd bereikbaar</em>')
              }}
            />
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={2}
              className="mt-6 text-[16px] leading-relaxed text-stone-500"
            >
              {content.about.paragraph}
            </motion.p>

            {/* Pillars */}
            <div className="mt-10 space-y-6">
              {content.about.pillars.map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  variants={fadeUp}
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  custom={3 + i}
                  className="flex gap-4"
                >
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <div className="h-2 w-2 rounded-full bg-accent" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-stone-900">
                      {pillar.title}
                    </h4>
                    <p className="mt-1 text-[14px] leading-relaxed text-stone-500">
                      {pillar.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   STATS
   ═══════════════════════════════════════ */
function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="border-y border-stone-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-stone-200">
          {content.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={i}
              className="text-center"
            >
              <p className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] text-stone-900 italic">
                {"prefix" in stat && stat.prefix}
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.15em] text-stone-400">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   CASE STUDY
   ═══════════════════════════════════════ */
function CaseStudy() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-accent py-16 sm:py-24">
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
            {/* Before */}
            <div className="text-center lg:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{content.case_study.before_label}</p>
              <p className="mt-2 font-serif text-[clamp(2.5rem,5vw,4rem)] text-white/40 italic line-through decoration-white/20">{content.case_study.before_value}</p>
              <p className="mt-1 text-[13px] text-white/50">belasting betaald per jaar</p>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <svg className="h-6 w-6 rotate-90 text-white lg:rotate-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>

            {/* After */}
            <div className="text-center lg:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">{content.case_study.after_label}</p>
              <p className="mt-2 font-serif text-[clamp(2.5rem,5vw,4rem)] text-white italic">{content.case_study.after_value}</p>
              <p className="mt-1 text-[13px] text-white/70">belasting betaald per jaar</p>
            </div>
          </div>

          {/* Bottom line */}
          <div className="mt-10 flex flex-col items-center gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-center sm:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-[22px] font-bold text-white">{content.case_study.savings}</p>
                <p className="text-[12px] text-white/60">{content.case_study.savings_label}</p>
              </div>
            </div>
            <div className="hidden h-8 w-px bg-white/10 sm:block" />
            <p className="max-w-md text-center text-[13px] leading-relaxed text-white/60 sm:text-left">
              {content.case_study.client} {content.case_study.description}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   CLIENT LOGOS
   ═══════════════════════════════════════ */
function ClientLogos() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const marqueeClients = [...content.clients, ...content.clients];

  return (
    <section ref={ref} className="py-10 sm:py-14 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400"
        >
          {content.client_logos.label}
        </motion.p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-warm-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-warm-white to-transparent" />
        <motion.div
          className="flex items-center gap-10 sm:gap-14"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          {marqueeClients.map((client, i) => (
            <span
              key={`${client.name}-${i}`}
              className={`shrink-0 text-stone-300 transition-colors hover:text-stone-500 ${client.style}`}
            >
              {client.name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   TEAM
   ═══════════════════════════════════════ */
const team = [
  {
    name: "Marieke van der Berg",
    role: "Directeur & Fiscalist",
    credentials: "RA \u00b7 RB \u00b7 18 jaar ervaring",
    bio: "Gespecialiseerd in holdingstructuren en DGA-advies",
    image: "https://images.letz.ai/dd5c4d93-aedf-481a-a670-f2d5c5917602/69a2bcfe-e05f-4dfa-9cbc-bbd402c11868/letz_Professional_corporate_headshot_portrait_of_a_conf20260215181641.jpg",
    alt: "Marieke van der Berg, directeur en fiscalist van Sterling & Partners, in professioneel studioportret",
  },
  {
    name: "Thomas de Vries",
    role: "Partner, Belastingadvies",
    credentials: "RB \u00b7 NOB \u00b7 15 jaar ervaring",
    bio: "Expert in vennootschapsbelasting en 30%-regeling",
    image: "https://images.letz.ai/dd5c4d93-aedf-481a-a670-f2d5c5917602/ae520015-ab5c-4e91-939c-ce6c52a53eb8/letz_Professional_corporate_headshot_portrait_of_a_dist20260215181649.jpg",
    alt: "Thomas de Vries, partner belastingadvies bij Sterling & Partners, in professioneel studioportret",
  },
  {
    name: "Sophie Jansen",
    role: "Senior Boekhouder",
    credentials: "AA \u00b7 CB \u00b7 10 jaar ervaring",
    bio: "Specialist in ZZP en e-commerce boekhouding",
    image: "https://images.letz.ai/dd5c4d93-aedf-481a-a670-f2d5c5917602/203f14ae-2f4d-4ffc-899b-ea504eb4a2bf/letz_Professional_corporate_headshot_portrait_of_a_youn20260215182213.jpg",
    alt: "Sophie Jansen, senior boekhouder bij Sterling & Partners, in professioneel studioportret",
  },
  {
    name: "Daan Bakker",
    role: "Salarisadministratie",
    credentials: "PDL \u00b7 8 jaar ervaring",
    bio: "Expert in loonadministratie en arbeidsrecht",
    image: "https://images.letz.ai/dd5c4d93-aedf-481a-a670-f2d5c5917602/21ad4892-731a-428b-8872-480ea8a1cc79/letz_Professional_corporate_headshot_portrait_of_a_frie20260215181709.jpg",
    alt: "Daan Bakker, salarisadministratie specialist bij Sterling & Partners, in professioneel studioportret",
  },
];

function Team() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section id="team" ref={ref} className="py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:mb-20 lg:flex-row lg:items-end">
          <div className="max-w-xl">
            <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
              <SectionLabel>{content.team.label}</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={1}
              className="font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-tight text-stone-900"
            >
              {content.team.headline_before}
              <br />
              <em className="text-accent">{content.team.headline_emphasis}</em>.
            </motion.h2>
          </div>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={2}
            className="max-w-sm text-[14px] leading-relaxed text-stone-500"
          >
            {content.team.description}
          </motion.p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-8 lg:grid-cols-4">
          {content.team.members.map((member, i) => (
            <motion.div
              key={member.name}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={i}
              className="group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone-100">
                <Image
                  src={member.image}
                  alt={member.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <div className="mt-3 sm:mt-5">
                <h3 className="text-[14px] font-semibold tracking-tight text-stone-900 sm:text-[16px]">
                  {member.name}
                </h3>
                <p className="mt-0.5 text-[12px] font-medium text-accent sm:mt-1 sm:text-[13px]">
                  {member.role}
                </p>
                <p className="hidden text-[11px] font-medium tracking-wide text-stone-400 sm:mt-1 sm:block">
                  {member.credentials}
                </p>
                <p className="mt-2 hidden text-[12px] leading-relaxed text-stone-500 sm:block">
                  {member.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════════ */

function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const paginate = (dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + content.testimonials.length) % content.testimonials.length);
  };

  // Auto-advance every 5s
  useEffect(() => {
    autoRef.current = setInterval(() => paginate(1), 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, []);

  const resetAuto = (dir: number) => {
    if (autoRef.current) clearInterval(autoRef.current);
    paginate(dir);
    autoRef.current = setInterval(() => paginate(1), 5000);
  };

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section id="testimonials" ref={ref} className="bg-stone-900 py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-light mb-4">
                Klantverhalen
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={1}
              className="font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-tight text-white"
            >
              Wat ondernemers
              <br />
              <em className="text-accent-light">over ons zeggen</em>.
            </motion.h2>
          </div>

          {/* Nav Arrows */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={2}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => resetAuto(-1)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all hover:border-white/30 hover:text-white"
              aria-label="Vorige"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => resetAuto(1)}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all hover:border-white/30 hover:text-white"
              aria-label="Volgende"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </motion.div>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid gap-8 lg:grid-cols-3"
            >
              {/* Show 1 on mobile, 3 on desktop */}
              {[0, 1, 2].map((offset) => {
                const idx = (current + offset) % content.testimonials.length;
                const t = content.testimonials[idx];
                return (
                  <div
                    key={t.author}
                    className={`relative rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm lg:p-10 ${
                      offset > 0 ? "hidden lg:block" : ""
                    }`}
                  >
                    <svg
                      className="mb-6 h-8 w-8 text-accent-light/40"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                    </svg>
                    <p className="text-[15px] leading-relaxed text-stone-300">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-8 flex items-center gap-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-full">
                        <Image
                          src={t.image}
                          alt={t.alt}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-white">{t.author}</p>
                        <p className="text-[12px] text-stone-400">{t.title}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="mt-10 flex items-center justify-center gap-2">
          {content.testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
                if (autoRef.current) clearInterval(autoRef.current);
                autoRef.current = setInterval(() => paginate(1), 5000);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-8 bg-accent-light" : "w-2 bg-white/20"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   PROCESS
   ═══════════════════════════════════════ */
function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-12 text-center sm:mb-20">
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
            <SectionLabel>{content.process.label}</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={1}
            className="mx-auto max-w-xl font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-tight text-stone-900"
          >
            {content.process.headline_before}{" "}
            <em className="text-accent">{content.process.headline_emphasis}</em>.
          </motion.h2>
        </div>

        <div className="mx-auto max-w-3xl">
          {content.process.steps.map((step, i) => (
            <motion.div
              key={step.step}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={i}
              className="relative flex gap-6 pb-12 last:pb-0 sm:gap-8"
            >
              {/* Timeline line */}
              {i < content.process.steps.length - 1 && (
                <div className="absolute left-[23px] top-14 bottom-0 w-px bg-stone-200 sm:left-[27px]" />
              )}
              {/* Step number circle */}
              <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent shadow-lg shadow-accent/20 sm:h-14 sm:w-14">
                <span className="font-serif text-lg text-white italic sm:text-xl">{step.step}</span>
              </div>
              {/* Content */}
              <div className="pt-1">
                <h3 className="text-[17px] font-semibold tracking-tight text-stone-900 sm:text-[19px]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Animated Price Display ─── */
function AnimatedPrice({ value }: { value: number }) {
  const motionValue = useMotionValue(value);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 20 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v: number) => {
      setDisplay(Math.round(v));
    });
    return unsubscribe;
  }, [spring]);

  return <>{display}</>;
}

/* ═══════════════════════════════════════
   PRICE CALCULATOR
   ═══════════════════════════════════════ */
function PriceCalculator() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const [bedrijfsvorm, setBedrijfsvorm] = useState<string>("zzp");
  const [facturen, setFacturen] = useState<string>("0-25");
  const [heeftPersoneel, setHeeftPersoneel] = useState(false);
  const [aantalMedewerkers, setAantalMedewerkers] = useState(1);
  const [extraDiensten, setExtraDiensten] = useState<Record<string, boolean>>({
    btw: true,
    jaarrekening: false,
    salaris: false,
    fiscaal: false,
  });

  const bedrijfsvormen = content.calculator.business_types;

  const facturenOpties = [
    { id: "0-25", label: "0 – 25", extra: 0 },
    { id: "25-50", label: "25 – 50", extra: 30 },
    { id: "50-100", label: "50 – 100", extra: 75 },
    { id: "100+", label: "100+", extra: 150 },
  ];

  /* ─── Market average multipliers (typical NL accountant) ─── */
  const marktMultiplier: Record<string, number> = {
    zzp: 1.55,
    vof: 1.50,
    bv: 1.45,
    "bv-holding": 1.40,
  };

  /* ─── Price calculation ─── */
  const basePrijs = bedrijfsvormen.find((b) => b.id === bedrijfsvorm)?.base ?? 89;
  const factuurExtra = facturenOpties.find((f) => f.id === facturen)?.extra ?? 0;
  const personeelExtra = heeftPersoneel ? aantalMedewerkers * 15 : 0;
  const jaarrekeningExtra = extraDiensten.jaarrekening ? 50 : 0;
  const salarisExtra = extraDiensten.salaris
    ? heeftPersoneel
      ? Math.max(25, aantalMedewerkers * 10)
      : 25
    : 0;
  const fiscaalExtra = extraDiensten.fiscaal ? 75 : 0;
  const totaal = basePrijs + factuurExtra + personeelExtra + jaarrekeningExtra + salarisExtra + fiscaalExtra;

  /* ─── Market comparison ─── */
  const multiplier = marktMultiplier[bedrijfsvorm] ?? 1.5;
  const marktPrijs = Math.round(totaal * multiplier);
  const besparing = marktPrijs - totaal;
  const besparingJaar = besparing * 12;

  /* ─── Smart recommendation ─── */
  const aanbevolenPlan = totaal <= 120 ? "ZZP Basis" : totaal <= 350 ? "MKB Groei" : "Onderneming Plus";
  const aanbevolenPlanId = totaal <= 120 ? 0 : totaal <= 350 ? 1 : 2;

  return (
    <section ref={ref} className="bg-stone-900 py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-4">Prijscalculator</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={1}
            className="mx-auto max-w-xl font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-tight text-white"
          >
            Wat kost uw boekhouder?{" "}
            <em className="text-accent">Reken het uit</em>.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={2}
            className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-stone-400"
          >
            Selecteer uw situatie en zie direct wat u per maand betaalt. Transparant, zonder verrassingen.
          </motion.p>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={3}
          className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_360px]"
        >
          {/* ─── Form ─── */}
          <div className="space-y-10">
            {/* Bedrijfsvorm */}
            <div>
              <h3 className="mb-4 text-[15px] font-semibold tracking-tight text-white">Bedrijfsvorm</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {bedrijfsvormen.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBedrijfsvorm(item.id)}
                    className={`rounded-2xl border px-4 py-4 text-center text-[13px] font-medium transition-all ${
                      bedrijfsvorm === item.id
                        ? "border-accent bg-accent/10 text-accent shadow-sm shadow-accent/10"
                        : "border-stone-600 bg-stone-700/50 text-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aantal facturen per maand */}
            <div>
              <h3 className="mb-4 text-[15px] font-semibold tracking-tight text-white">Aantal facturen per maand</h3>
              <div className="flex flex-wrap gap-3">
                {facturenOpties.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFacturen(item.id)}
                    className={`rounded-full border px-6 py-2.5 text-[13px] font-medium transition-all ${
                      facturen === item.id
                        ? "border-accent bg-accent/10 text-accent shadow-sm shadow-accent/10"
                        : "border-stone-600 bg-stone-700/50 text-stone-200 hover:border-stone-400"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personeel */}
            <div>
              <h3 className="mb-4 text-[15px] font-semibold tracking-tight text-white">Personeel</h3>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  {["Nee", "Ja"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setHeeftPersoneel(label === "Ja")}
                      className={`rounded-full border px-5 py-2.5 text-[13px] font-medium transition-all ${
                        (label === "Ja") === heeftPersoneel
                          ? "border-accent bg-accent/10 text-accent shadow-sm shadow-accent/10"
                          : "border-stone-600 bg-stone-700/50 text-stone-200 hover:border-stone-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {heeftPersoneel && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <label className="text-[13px] text-stone-400">Hoeveel medewerkers?</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={aantalMedewerkers}
                      onChange={(e) => setAantalMedewerkers(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                      className="w-20 rounded-xl border border-stone-600 bg-stone-700/50 px-3 py-2.5 text-center text-[14px] font-medium text-white outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/20"
                    />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Extra diensten */}
            <div>
              <h3 className="mb-4 text-[15px] font-semibold tracking-tight text-white">Extra diensten</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "btw", label: "BTW-aangifte", included: true },
                  { id: "jaarrekening", label: "Jaarrekening", included: false },
                  { id: "salaris", label: "Salarisadministratie", included: false },
                  { id: "fiscaal", label: "Fiscaal advies", included: false },
                ].map((dienst) => (
                  <label
                    key={dienst.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-5 py-4 text-[13px] font-medium transition-all ${
                      dienst.included
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : extraDiensten[dienst.id]
                          ? "border-accent bg-accent/10 text-accent shadow-sm shadow-accent/10"
                          : "border-stone-600 bg-stone-700/50 text-stone-200 hover:border-stone-400"
                    } ${dienst.included ? "pointer-events-none" : ""}`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                        extraDiensten[dienst.id] || dienst.included
                          ? "border-accent bg-accent"
                          : "border-stone-500 bg-stone-600"
                      }`}
                    >
                      {(extraDiensten[dienst.id] || dienst.included) && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={extraDiensten[dienst.id]}
                      disabled={dienst.included}
                      onChange={() =>
                        setExtraDiensten((prev) => ({ ...prev, [dienst.id]: !prev[dienst.id] }))
                      }
                      className="sr-only"
                    />
                    {dienst.label}
                    {dienst.included && (
                      <span className="ml-auto text-[11px] font-normal text-accent/70">Inbegrepen</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Result Card ─── */}
          <div className="lg:sticky lg:top-32 lg:self-start space-y-4">
            <div className="rounded-2xl border border-stone-700 bg-stone-800 p-8 shadow-xl shadow-black/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">Uw indicatieprijs</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-[18px] font-medium text-accent">&euro;</span>
                <span className="font-serif text-[clamp(3rem,5vw,4rem)] leading-none tracking-tight text-accent italic">
                  <AnimatedPrice value={totaal} />
                </span>
                <span className="ml-1 text-[15px] text-stone-400">/maand</span>
              </div>
              <p className="mt-1 text-[12px] text-stone-400">excl. BTW</p>

              {/* ─── Savings Comparison ─── */}
              <div className="mt-5 rounded-xl bg-accent/10 border border-accent/20 px-4 py-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-stone-300">Marktgemiddelde</span>
                  <span className="font-medium text-stone-400 line-through">&euro;<AnimatedPrice value={marktPrijs} /></span>
                </div>
                <div className="mt-1 flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-accent">U bespaart</span>
                  <span className="font-bold text-accent">&euro;<AnimatedPrice value={besparingJaar} /> /jaar</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="mt-6 space-y-2 border-t border-stone-700 pt-5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-stone-400">Basispakket</span>
                  <span className="font-medium text-stone-200">&euro;{basePrijs}</span>
                </div>
                {factuurExtra > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-stone-400">Factuurverwerking</span>
                    <span className="font-medium text-stone-200">+&euro;{factuurExtra}</span>
                  </div>
                )}
                {personeelExtra > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-stone-400">Personeel ({aantalMedewerkers}x)</span>
                    <span className="font-medium text-stone-200">+&euro;{personeelExtra}</span>
                  </div>
                )}
                {jaarrekeningExtra > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-stone-400">Jaarrekening</span>
                    <span className="font-medium text-stone-200">+&euro;{jaarrekeningExtra}</span>
                  </div>
                )}
                {salarisExtra > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-stone-400">Salarisadministratie</span>
                    <span className="font-medium text-stone-200">+&euro;{salarisExtra}</span>
                  </div>
                )}
                {fiscaalExtra > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-stone-400">Fiscaal advies</span>
                    <span className="font-medium text-stone-200">+&euro;{fiscaalExtra}</span>
                  </div>
                )}
              </div>

              <a
                href="#contact"
                className="mt-8 block rounded-full border border-stone-700 bg-transparent py-3.5 text-center text-[14px] font-medium text-stone-500 transition-all hover:border-stone-500 hover:text-stone-300"
              >
                Ontvang uw persoonlijke offerte
              </a>
              <p className="mt-4 text-center text-[12px] leading-relaxed text-stone-500">
                Dit is een indicatie. De exacte prijs bespreken wij graag persoonlijk.
              </p>
            </div>

            {/* ─── Smart Recommendation ─── */}
            <motion.a
              href="#tarieven"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="group flex items-center gap-3 rounded-2xl border border-accent/20 bg-accent/5 px-5 py-4 transition-all hover:border-accent/40 hover:bg-accent/10"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/20">
                <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-stone-400">Ons advies voor u</p>
                <p className="text-[14px] font-semibold text-accent">{aanbevolenPlan}</p>
              </div>
              <svg className="h-4 w-4 text-accent/50 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   PRICING
   ═══════════════════════════════════════ */
function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [activePlan, setActivePlan] = useState(1);

  const plans = content.pricing.plans;

  return (
    <section id="tarieven" ref={ref} className="bg-cream py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-10 text-center sm:mb-16">
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
            <SectionLabel>{content.pricing.label}</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={1}
            className="mx-auto max-w-xl font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-tight text-stone-900"
          >
            {content.pricing.headline_before}{" "}
            <em className="text-accent">{content.pricing.headline_emphasis}</em>.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={2}
            className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-stone-500"
          >
            {content.pricing.description}
          </motion.p>
        </div>

        {/* Mobile: Tab selector + single card */}
        <div className="lg:hidden">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={3}
            className="mb-6 flex rounded-2xl border border-stone-200 bg-white p-1"
          >
            {plans.map((plan, i) => (
              <button
                key={plan.name}
                onClick={() => setActivePlan(i)}
                className={`relative flex-1 rounded-xl py-3 text-center text-[13px] font-semibold transition-all ${
                  activePlan === i
                    ? "bg-accent text-white shadow-sm"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {plan.name}
                {plan.highlight && activePlan !== i && (
                  <span className="absolute -top-1 right-2 h-2 w-2 rounded-full bg-accent" />
                )}
              </button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePlan}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className={`relative rounded-2xl border p-6 sm:p-8 ${
                plans[activePlan].highlight
                  ? "border-accent bg-white shadow-xl shadow-accent/10"
                  : "border-stone-200 bg-white"
              }`}
            >
              {plans[activePlan].highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                  Populairste keuze
                </span>
              )}
              <div className="flex items-baseline justify-between">
                <h3 className="text-[18px] font-semibold text-stone-900">{plans[activePlan].name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-[2.5rem] text-stone-900 italic">
                    {plans[activePlan].price}
                  </span>
                  <span className="text-[14px] text-stone-500">{plans[activePlan].period}</span>
                </div>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-stone-500">
                {plans[activePlan].description}
              </p>

              <ul className="mt-6 space-y-2.5">
                {plans[activePlan].features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[13px] text-stone-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`mt-6 block rounded-full py-3.5 text-center text-[14px] font-semibold transition-all ${
                  plans[activePlan].highlight
                    ? "bg-accent text-white hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20"
                    : "border border-stone-200 text-stone-700 hover:border-accent hover:text-accent"
                }`}
              >
                {plans[activePlan].price === "Op maat" ? "Offerte aanvragen" : "Kies dit pakket"}
              </a>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop: 3-column grid */}
        <div className="hidden gap-8 lg:grid lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={i}
            >
              <TiltCard className={`relative rounded-2xl border p-8 lg:p-10 h-full ${
                plan.highlight
                  ? "border-accent bg-white shadow-xl shadow-accent/10"
                  : "border-stone-200 bg-white"
              }`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    Populairste keuze
                  </span>
                )}
                <h3 className="text-[18px] font-semibold text-stone-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-serif text-[clamp(2.5rem,4vw,3.5rem)] text-stone-900 italic">
                    {plan.price}
                  </span>
                  <span className="text-[14px] text-stone-500">{plan.period}</span>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-stone-500">
                  {plan.description}
                </p>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[14px] text-stone-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="#contact"
                  className={`mt-8 block rounded-full py-3.5 text-center text-[14px] font-semibold transition-all ${
                    plan.highlight
                      ? "bg-accent text-white hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20"
                      : "border border-stone-200 text-stone-700 hover:border-accent hover:text-accent"
                  }`}
                >
                  {plan.price === "Op maat" ? "Offerte aanvragen" : "Kies dit pakket"}
                </a>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   INTEGRATIONS
   ═══════════════════════════════════════ */
function Integrations() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const tools = [
    {
      name: "Exact Online",
      logo: (
        <svg viewBox="0 0 120 36" className="h-9 w-28">
          <text x="0" y="26" fill="#e94d10" fontSize="22" fontWeight="700" fontFamily="system-ui">exact</text>
          <text x="72" y="26" fill="#666" fontSize="12" fontWeight="400" fontFamily="system-ui">online</text>
        </svg>
      ),
    },
    {
      name: "Twinfield",
      logo: (
        <svg viewBox="0 0 100 36" className="h-9 w-24">
          <text x="0" y="26" fill="#00a1e0" fontSize="20" fontWeight="700" fontFamily="system-ui">twinfield</text>
        </svg>
      ),
    },
    {
      name: "Yuki",
      logo: (
        <svg viewBox="0 0 60 36" className="h-9 w-16">
          <circle cx="14" cy="18" r="12" fill="#00b2a9"/>
          <text x="14" y="23" textAnchor="middle" fill="white" fontSize="12" fontWeight="800" fontFamily="system-ui">Y</text>
          <text x="32" y="25" fill="#00b2a9" fontSize="16" fontWeight="700" fontFamily="system-ui">uki</text>
        </svg>
      ),
    },
    {
      name: "Visma",
      logo: (
        <svg viewBox="0 0 80 36" className="h-9 w-20">
          <text x="0" y="25" fill="#1a1a5e" fontSize="20" fontWeight="800" fontFamily="system-ui">visma</text>
        </svg>
      ),
    },
    {
      name: "Xero",
      logo: (
        <svg viewBox="0 0 60 36" className="h-9 w-16">
          <text x="0" y="26" fill="#13B5EA" fontSize="22" fontWeight="800" fontFamily="system-ui">xero</text>
        </svg>
      ),
    },
    {
      name: "Mollie",
      logo: (
        <svg viewBox="0 0 70 36" className="h-9 w-18">
          <text x="0" y="25" fill="#000" fontSize="20" fontWeight="800" fontFamily="system-ui">mollie</text>
        </svg>
      ),
    },
    {
      name: "Stripe",
      logo: (
        <svg viewBox="0 0 70 36" className="h-9 w-18">
          <text x="0" y="26" fill="#635BFF" fontSize="22" fontWeight="700" fontFamily="system-ui">stripe</text>
        </svg>
      ),
    },
    {
      name: "Snelstart",
      logo: (
        <svg viewBox="0 0 100 36" className="h-9 w-24">
          <text x="0" y="25" fill="#f7941d" fontSize="18" fontWeight="700" fontFamily="system-ui">snelstart</text>
        </svg>
      ),
    },
  ];

  const marqueeItems = [...tools, ...tools];

  return (
    <section ref={ref} className="border-y border-stone-200 bg-white py-12 sm:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.p
          variants={fadeIn}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400 sm:mb-10"
        >
          Wij werken met de software die u al kent
        </motion.p>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-white to-transparent" />
        <motion.div
          className="flex items-center gap-12 sm:gap-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
        >
          {marqueeItems.map((tool, i) => (
            <div
              key={`${tool.name}-${i}`}
              className="shrink-0 opacity-60 transition-opacity duration-300 hover:opacity-100"
            >
              {tool.logo}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   BLOG PREVIEW
   ═══════════════════════════════════════ */

function BlogPreview() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 max-w-2xl sm:mb-20">
          <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
            <SectionLabel>{content.blog.label}</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            custom={1}
            className="font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-tight text-stone-900"
          >
            {content.blog.headline_before}{" "}
            <em className="text-accent">{content.blog.headline_emphasis}</em>.
          </motion.h2>
        </div>

        {/* Blog Grid — horizontal cards on mobile, vertical on tablet+ */}
        <div className="grid gap-4 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {content.blog.posts.map((post, i) => (
            <motion.article
              key={post.title}
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={i}
              className="group rounded-2xl border border-stone-200/60 bg-white transition-all duration-500 hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5"
            >
              {/* Mobile: horizontal layout */}
              <div className="flex sm:hidden">
                <div className="relative w-28 shrink-0 overflow-hidden rounded-l-2xl">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center p-4">
                  <span className="inline-block self-start rounded-full bg-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                    {post.category}
                  </span>
                  <h3 className="mt-2 text-[15px] font-semibold leading-snug tracking-tight text-stone-900 line-clamp-2">
                    {post.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <a href="#" className="text-[12px] font-medium text-accent">
                      Lees meer &rarr;
                    </a>
                    <span className="text-[11px] text-stone-400">{post.date}</span>
                  </div>
                </div>
              </div>

              {/* Tablet+: vertical card layout */}
              <div className="hidden sm:block">
                <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6 lg:p-8">
                  <span className="inline-block rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent">
                    {post.category}
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold leading-snug tracking-tight text-stone-900">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-stone-500">
                    {post.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                    <a
                      href="#"
                      className="inline-flex items-center gap-1 text-[13px] font-medium text-accent transition-colors hover:text-accent-light"
                    >
                      Lees meer
                      <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
                    </a>
                    <span className="text-[12px] text-stone-400">{post.date}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   FAQ
   ═══════════════════════════════════════ */

function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section ref={ref} className="py-16 sm:py-28 lg:py-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-10 sm:gap-16 lg:grid-cols-[1fr_1.5fr] lg:gap-24">
          {/* Left — Header */}
          <div>
            <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
              <SectionLabel>Veelgestelde Vragen</SectionLabel>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={1}
              className="font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-tight text-stone-900"
            >
              Vragen die wij
              <br />
              <em className="text-accent">vaak horen</em>.
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              custom={2}
              className="mt-4 text-[14px] leading-relaxed text-stone-500"
            >
              Staat uw vraag er niet bij?{" "}
              <a href="#contact" className="font-medium text-accent underline underline-offset-2">
                Neem direct contact op
              </a>
              .
            </motion.p>
          </div>

          {/* Right — Accordion */}
          <div>
            {content.faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                custom={i * 0.3}
                className="border-b border-stone-200"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-6 text-left"
                >
                  <span className="text-[15px] font-semibold tracking-tight text-stone-900">
                    {faq.question}
                  </span>
                  <motion.svg
                    animate={{ rotate: openIndex === i ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-5 w-5 shrink-0 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </motion.svg>
                </button>
                <motion.div
                  initial={false}
                  animate={
                    openIndex === i
                      ? { height: "auto", opacity: 1 }
                      : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 text-[14px] leading-relaxed text-stone-500">
                    {faq.answer}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   CTA
   ═══════════════════════════════════════ */
function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const scheduler = useScheduler();

  return (
    <section id="contact" ref={ref} className="relative overflow-hidden bg-accent py-16 sm:py-28 lg:py-36">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-12">
        <motion.div variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"} custom={0}>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-4">
            {content.cta.label}
          </span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={1}
          className="font-serif text-[clamp(2.2rem,5vw,4rem)] leading-[1.08] tracking-tight text-white"
          dangerouslySetInnerHTML={{ __html: content.cta.headline.replace(/\n/g, '<br />') }}
        />
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={2}
          className="mx-auto mt-6 max-w-lg text-[16px] leading-relaxed text-white/70"
        >
          {content.cta.description}
        </motion.p>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          custom={3}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <button
            onClick={(e) => { e.preventDefault(); scheduler.open(); }}
            className="group inline-flex items-center gap-3 rounded-full bg-white px-10 py-4 text-[15px] font-semibold text-accent transition-all hover:shadow-2xl hover:shadow-black/20 cursor-pointer"
          >
            {content.hero.cta_primary}
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <a
            href={`tel:+${content.company.phone_raw}`}
            className="inline-flex items-center gap-2 text-[14px] font-medium text-white/80 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {content.company.phone}
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════ */
function Footer() {
  return (
    <footer className="bg-stone-900 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Brand — full width on mobile */}
        <div className="pb-10 border-b border-white/10 mb-10 lg:border-0 lg:pb-0 lg:mb-0 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
              <span className="font-serif text-lg text-white italic">S</span>
            </div>
            <div className="leading-tight">
              <span className="text-[15px] font-semibold text-white">Sterling</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.15em] text-stone-500">
                & Partners
              </span>
            </div>
          </div>
          <p className="mt-6 max-w-xs text-[13px] leading-relaxed text-stone-400">
            {content.company.description}
          </p>
          <div className="mt-6 flex items-center gap-4">
            {[
              {
                label: "LinkedIn",
                icon: (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                ),
              },
              {
                label: "Facebook",
                icon: (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                ),
              },
              {
                label: "Instagram",
                icon: (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                ),
              },
            ].map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.label}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-stone-400 transition-all hover:bg-accent hover:text-white"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile: 2-col grid (Contact left, Bedrijf right) + Desktop: 4-col */}
        <div className="grid grid-cols-2 gap-8 pb-16 lg:grid-cols-4 lg:gap-12">
          {/* Brand — desktop only (hidden on mobile, shown above) */}
          <div className="hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                <span className="font-serif text-lg text-white italic">S</span>
              </div>
              <div className="leading-tight">
                <span className="text-[15px] font-semibold text-white">Sterling</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.15em] text-stone-500">
                  & Partners
                </span>
              </div>
            </div>
            <p className="mt-6 max-w-xs text-[13px] leading-relaxed text-stone-400">
              Boekhouders en belastingadviseurs voor ondernemers in Nederland.
              Persoonlijk, betrouwbaar en altijd bereikbaar.
            </p>
            <div className="mt-6 flex items-center gap-4">
              {[
                {
                  label: "LinkedIn",
                  icon: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                },
                {
                  label: "Facebook",
                  icon: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
                {
                  label: "Instagram",
                  icon: (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  ),
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-stone-400 transition-all hover:bg-accent hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contact — left on mobile, 4th col on desktop */}
          <div className="order-1 lg:order-4">
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
              Contact
            </h4>
            <ul className="space-y-3 text-[13px] text-stone-400">
              <li>Zuidas, {content.company.address}</li>
              <li>{content.company.postcode} {content.company.city}</li>
              <li className="pt-2">
                <a href={`tel:+${content.company.phone_raw}`} className="transition-colors hover:text-white">
                  {content.company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${content.company.email}`} className="transition-colors hover:text-white">
                  {content.company.email}
                </a>
              </li>
              <li className="pt-4 text-[11px] text-stone-500">
                KvK: {content.company.kvk}
              </li>
              <li className="text-[11px] text-stone-500">
                BTW-ID: {content.company.btw_id}
              </li>
            </ul>
          </div>

          {/* Bedrijf — right on mobile, 3rd col on desktop */}
          <div className="order-2 lg:order-3">
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
              Bedrijf
            </h4>
            <ul className="space-y-3">
              {content.footer.bedrijf.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-[13px] text-stone-400 transition-colors hover:text-white">
                      {item.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Diensten — full width row below on mobile, 2nd col on desktop */}
          <div className="order-3 col-span-2 lg:order-2 lg:col-span-1">
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-stone-500">
              Diensten
            </h4>
            <ul className="grid grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-1">
              {content.footer.diensten.map((item) => (
                <li key={item}>
                  <a href="#diensten" className="text-[13px] text-stone-400 transition-colors hover:text-white">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-[12px] text-stone-500">
            &copy; {new Date().getFullYear()} {content.company.name}. {content.footer_ui.copyright}
          </p>
          <div className="flex gap-6">
            {["Privacybeleid", "Algemene Voorwaarden", "Sitemap"].map((item) => (
              <a key={item} href="#" className="text-[12px] text-stone-500 transition-colors hover:text-stone-300">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════
   GDPR COOKIE BANNER
   ═══════════════════════════════════════ */
function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", JSON.stringify({ necessary: true, analytics: true, marketing: true }));
    setVisible(false);
  }

  function reject() {
    localStorage.setItem("cookie-consent", JSON.stringify({ necessary: true, analytics: false, marketing: false }));
    setVisible(false);
  }

  function saveSettings() {
    localStorage.setItem("cookie-consent", JSON.stringify({ necessary: true, analytics, marketing }));
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 border-t border-stone-200 bg-white/95 p-5 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md sm:p-6 md:bottom-6 md:left-6 md:right-auto md:max-w-md md:rounded-2xl md:border md:border-stone-200"
        >
          <p className="text-[13px] leading-relaxed text-stone-600">
            Wij gebruiken cookies om uw ervaring te verbeteren en onze diensten te optimaliseren.{" "}
            <a href="#" className="font-medium text-accent underline underline-offset-2 transition-colors hover:text-accent/80">
              Lees ons privacybeleid
            </a>
          </p>

          {/* Settings expansion */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
                  {/* Noodzakelijk — always on */}
                  <label className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-stone-700">Noodzakelijk</span>
                    <div className="relative h-6 w-10 cursor-not-allowed rounded-full bg-accent/80">
                      <div className="absolute top-0.5 left-[18px] h-5 w-5 rounded-full bg-white shadow-sm" />
                    </div>
                  </label>
                  {/* Analytisch */}
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="text-[13px] font-medium text-stone-700">Analytisch</span>
                    <button
                      onClick={() => setAnalytics(!analytics)}
                      className={`relative h-6 w-10 rounded-full transition-colors duration-200 ${analytics ? "bg-accent" : "bg-stone-300"}`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${analytics ? "left-[18px]" : "left-0.5"}`}
                      />
                    </button>
                  </label>
                  {/* Marketing */}
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="text-[13px] font-medium text-stone-700">Marketing</span>
                    <button
                      onClick={() => setMarketing(!marketing)}
                      className={`relative h-6 w-10 rounded-full transition-colors duration-200 ${marketing ? "bg-accent" : "bg-stone-300"}`}
                    >
                      <div
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${marketing ? "left-[18px]" : "left-0.5"}`}
                      />
                    </button>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={accept}
              className="flex-1 rounded-full bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent/90"
            >
              Accepteren
            </button>
            <button
              onClick={showSettings ? saveSettings : () => setShowSettings(true)}
              className="flex-1 rounded-full border border-stone-300 px-4 py-2.5 text-[13px] font-semibold text-stone-700 transition-colors hover:bg-stone-100"
            >
              {showSettings ? "Opslaan" : "Instellingen"}
            </button>
            <button
              onClick={reject}
              className="rounded-full px-4 py-2.5 text-[13px] font-medium text-stone-500 transition-colors hover:text-stone-700"
            >
              Weigeren
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════
   WHATSAPP FLOATING BUTTON
   ═══════════════════════════════════════ */
function WhatsAppButton() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-40 mb-20 md:mb-0"
        >
          <a
            href={`https://wa.me/${content.company.whatsapp}?text=${encodeURIComponent(content.whatsapp.message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow hover:shadow-xl"
            style={{ backgroundColor: "#25D366" }}
          >
            {/* WhatsApp Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-7 w-7"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {/* Tooltip */}
            <span className="pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-stone-900 px-3 py-1.5 text-[12px] font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {content.whatsapp.tooltip}
              <span className="absolute -right-1 top-1/2 -translate-y-1/2 border-4 border-transparent border-l-stone-900" />
            </span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════
   PAGE ASSEMBLY
   ═══════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[10000] h-[3px] origin-left bg-accent"
      style={{ scaleX: scrollYProgress }}
    />
  );
}

/* ═══════════════════════════════════════
   SCHEDULER CONTEXT
   ═══════════════════════════════════════ */
const SchedulerContext = createContext<{ open: () => void }>({ open: () => {} });

function useScheduler() {
  return useContext(SchedulerContext);
}

/* ═══════════════════════════════════════
   SCHEDULER MODAL
   ═══════════════════════════════════════ */
function SchedulerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [pakket, setPakket] = useState("mkb-groei");
  const [datum, setDatum] = useState("");
  const [tijd, setTijd] = useState("");
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [bedrijf, setBedrijf] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    if (d.getDay() === 0 || d.getDay() === 6) return null;
    return d;
  }).filter(Boolean) as Date[];

  const tijdsloten = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];

  const formatDate = (d: Date) => d.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
  const formatDateKey = (d: Date) => d.toISOString().split("T")[0];

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStep(0);
      setPakket("mkb-groei");
      setDatum("");
      setTijd("");
      setNaam("");
      setEmail("");
      setTelefoon("");
      setBedrijf("");
      onClose();
    }, 3000);
  };

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(0);
        setSubmitted(false);
      }, 300);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-400 transition-colors hover:bg-stone-200 hover:text-stone-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="border-b border-stone-100 px-6 pt-6 pb-4 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                  <span className="font-serif text-lg text-white italic">S</span>
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-stone-900">Gratis Adviesgesprek</h3>
                  <p className="text-[12px] text-stone-400">30 minuten — vrijblijvend</p>
                </div>
              </div>

              {/* Progress */}
              {!submitted && (
                <div className="mt-4 flex gap-1.5">
                  {[0, 1, 2].map((s) => (
                    <div
                      key={s}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        s <= step ? "bg-accent" : "bg-stone-200"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-6 py-6 sm:px-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center py-8 text-center"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                    <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="mt-4 text-[18px] font-semibold text-stone-900">Afspraak ingepland!</h4>
                  <p className="mt-2 text-[14px] text-stone-500">
                    U ontvangt een bevestiging op {email || "uw e-mail"}.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {/* Step 1: Pakket */}
                  {step === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="text-[15px] font-semibold text-stone-900">Welk pakket heeft uw interesse?</h4>
                      <p className="mt-1 text-[13px] text-stone-400">U kunt dit later nog wijzigen.</p>
                      <div className="mt-5 space-y-2.5">
                        {[
                          { id: "zzp-basis", name: "ZZP Basis", price: "€99/maand", desc: "Boekhouding & BTW voor ZZP'ers" },
                          { id: "mkb-groei", name: "MKB Groei", price: "€299/maand", desc: "Compleet pakket met fiscaal advies", popular: true },
                          { id: "onderneming-plus", name: "Onderneming Plus", price: "Op maat", desc: "Maatwerk voor grotere bedrijven" },
                          { id: "weet-niet", name: "Weet ik nog niet", price: "", desc: "Bespreek opties tijdens het gesprek" },
                        ].map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setPakket(p.id)}
                            className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all ${
                              pakket === p.id
                                ? "border-accent bg-accent/5 shadow-sm shadow-accent/10"
                                : "border-stone-200 hover:border-stone-300"
                            }`}
                          >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                              pakket === p.id ? "border-accent bg-accent" : "border-stone-300"
                            }`}>
                              {pakket === p.id && (
                                <div className="h-2 w-2 rounded-full bg-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-semibold text-stone-900">{p.name}</span>
                                {p.popular && (
                                  <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">Populair</span>
                                )}
                              </div>
                              <span className="text-[12px] text-stone-400">{p.desc}</span>
                            </div>
                            {p.price && <span className="text-[13px] font-medium text-stone-500">{p.price}</span>}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="mt-6 w-full rounded-full bg-accent py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20"
                      >
                        Kies datum & tijd
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2: Datum & Tijd */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="text-[15px] font-semibold text-stone-900">Kies een datum</h4>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {dates.slice(0, 10).map((d) => (
                          <button
                            key={formatDateKey(d)}
                            onClick={() => setDatum(formatDateKey(d))}
                            className={`rounded-xl border px-3 py-2.5 text-[12px] font-medium transition-all ${
                              datum === formatDateKey(d)
                                ? "border-accent bg-accent/5 text-accent"
                                : "border-stone-200 text-stone-600 hover:border-stone-300"
                            }`}
                          >
                            {formatDate(d)}
                          </button>
                        ))}
                      </div>

                      {datum && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <h4 className="mt-6 text-[15px] font-semibold text-stone-900">Kies een tijd</h4>
                          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                            {tijdsloten.map((t) => (
                              <button
                                key={t}
                                onClick={() => setTijd(t)}
                                className={`rounded-lg border py-2.5 text-center text-[13px] font-medium transition-all ${
                                  tijd === t
                                    ? "border-accent bg-accent/5 text-accent"
                                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setStep(0)}
                          className="flex-1 rounded-full border border-stone-200 py-3.5 text-[14px] font-medium text-stone-600 transition-colors hover:bg-stone-50"
                        >
                          Terug
                        </button>
                        <button
                          onClick={() => datum && tijd && setStep(2)}
                          className={`flex-1 rounded-full py-3.5 text-[14px] font-semibold text-white transition-all ${
                            datum && tijd
                              ? "bg-accent hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20"
                              : "bg-stone-300 cursor-not-allowed"
                          }`}
                        >
                          Verder
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Contactgegevens */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h4 className="text-[15px] font-semibold text-stone-900">Uw gegevens</h4>
                      <p className="mt-1 text-[13px] text-stone-400">Zodat wij u kunnen bevestigen.</p>
                      <div className="mt-5 space-y-3">
                        <div>
                          <label className="text-[12px] font-medium text-stone-500">Naam *</label>
                          <input
                            type="text"
                            value={naam}
                            onChange={(e) => setNaam(e.target.value)}
                            placeholder="Jan de Vries"
                            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-accent focus:ring-1 focus:ring-accent/20"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-stone-500">E-mail *</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jan@bedrijf.nl"
                            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-accent focus:ring-1 focus:ring-accent/20"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-stone-500">Telefoon</label>
                          <input
                            type="tel"
                            value={telefoon}
                            onChange={(e) => setTelefoon(e.target.value)}
                            placeholder="06 12345678"
                            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-accent focus:ring-1 focus:ring-accent/20"
                          />
                        </div>
                        <div>
                          <label className="text-[12px] font-medium text-stone-500">Bedrijfsnaam</label>
                          <input
                            type="text"
                            value={bedrijf}
                            onChange={(e) => setBedrijf(e.target.value)}
                            placeholder="Uw Bedrijf B.V."
                            className="mt-1 w-full rounded-xl border border-stone-200 px-4 py-3 text-[14px] text-stone-900 outline-none transition-colors placeholder:text-stone-300 focus:border-accent focus:ring-1 focus:ring-accent/20"
                          />
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mt-5 rounded-xl bg-stone-50 px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">Samenvatting</p>
                        <div className="mt-2 space-y-1 text-[13px] text-stone-600">
                          <p>Pakket: <span className="font-medium text-stone-900">{pakket === "weet-niet" ? "Nog te bepalen" : pakket.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</span></p>
                          <p>Datum: <span className="font-medium text-stone-900">{datum ? new Date(datum).toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" }) : "—"}</span></p>
                          <p>Tijd: <span className="font-medium text-stone-900">{tijd || "—"}</span></p>
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setStep(1)}
                          className="flex-1 rounded-full border border-stone-200 py-3.5 text-[14px] font-medium text-stone-600 transition-colors hover:bg-stone-50"
                        >
                          Terug
                        </button>
                        <button
                          onClick={() => naam && email && handleSubmit()}
                          className={`flex-1 rounded-full py-3.5 text-[14px] font-semibold text-white transition-all ${
                            naam && email
                              ? "bg-accent hover:bg-accent-light hover:shadow-lg hover:shadow-accent/20"
                              : "bg-stone-300 cursor-not-allowed"
                          }`}
                        >
                          Bevestig afspraak
                        </button>
                      </div>

                      <p className="mt-4 text-center text-[11px] text-stone-400">
                        Door te bevestigen gaat u akkoord met ons privacybeleid.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const [schedulerOpen, setSchedulerOpen] = useState(false);

  const openScheduler = useCallback(() => setSchedulerOpen(true), []);

  // Intercept all #contact clicks to open the scheduler instead
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href='#contact']");
      if (anchor) {
        e.preventDefault();
        setSchedulerOpen(true);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <SchedulerContext.Provider value={{ open: openScheduler }}>
      <ScrollProgress />
      <StickyCTA />
      <Navigation />
      <Hero />
      <TrustBar />
      <ClientLogos />
      <Services />
      <Industries />
      <About />
      <Stats />
      <CaseStudy />
      <Team />
      <Testimonials />
      <Process />
      <PriceCalculator />
      <Pricing />
      <Integrations />
      <BlogPreview />
      <FAQ />
      <CTA />
      <Footer />
      <CookieBanner />
      <WhatsAppButton />
      <SchedulerModal isOpen={schedulerOpen} onClose={() => setSchedulerOpen(false)} />
    </SchedulerContext.Provider>
  );
}
