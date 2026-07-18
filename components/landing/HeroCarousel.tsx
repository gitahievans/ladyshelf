"use client";

import { type ReactElement, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { brandMedia } from "@/lib/mock/media";
import { fadeUpVariant, staggerContainer } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/cn";

interface HeroSlide {
  image: string;
  label: string;
  headline: string;
  subtitle: string;
}

const slides: HeroSlide[] = [
  {
    image: brandMedia.heroSlides[0] ?? brandMedia.hero,
    label: "New Season 2026",
    headline: "The Future of Fashion Is Here",
    subtitle: "Premium women's fashion, curated for every chapter of your story.",
  },
  {
    image: brandMedia.heroSlides[1] ?? brandMedia.hero,
    label: "Luxury African Wear",
    headline: "Your Heritage, Elevated",
    subtitle: "Kitenge, ankara, and fusion pieces designed for the modern African woman.",
  },
  {
    image: brandMedia.heroSlides[2] ?? brandMedia.hero,
    label: "Office to Evening",
    headline: "Dressing Like A Main Character",
    subtitle: "She doesn't dress for the job she has. She dresses for the story she's writing.",
  },
  {
    image: brandMedia.heroSlides[3] ?? brandMedia.hero,
    label: "Refined Occasionwear",
    headline: "Presence, Tailored",
    subtitle: "Statement silhouettes and quiet luxury for moments that deserve a stronger entrance.",
  },
  {
    image: brandMedia.heroSlides[4] ?? brandMedia.hero,
    label: "Lady Shelf Signatures",
    headline: "Crafted for the Modern Muse",
    subtitle: "Editorial texture, elevated cuts, and African fashion with a more intentional point of view.",
  },
];

export default function HeroCarousel(): ReactElement {
  const reducedMotion = useReducedMotion();
  const [activeSlide, setActiveSlide] = useState<number>(0);

  useEffect((): (() => void) => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return (): void => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <motion.section
      className="relative -mt-[60px] min-h-[80vh] overflow-hidden lg:-mt-[var(--navbar-height)] lg:min-h-screen"
      data-navbar-overlay="true"
      initial="hidden"
      variants={fadeUpVariant}
      viewport={{ once: true, margin: "-80px" }}
      whileInView="visible"
    >
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <motion.div
            key={slide.headline}
            animate={{ opacity: index === activeSlide ? 1 : 0 }}
            className="absolute inset-0"
            initial={false}
            transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut" }}
          >
            <Image
              alt={slide.headline}
              className="object-cover object-contain"
              fill
              priority={index === 0}
              sizes="100vw"
              src={slide.image}
            />
            <div className="absolute inset-0 bg-mahogany/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/45 to-transparent" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-container items-center px-6 py-24 lg:min-h-screen lg:px-8">
        <motion.div
          key={slides[activeSlide]?.headline}
          animate="visible"
          className="max-w-3xl space-y-6"
          initial="hidden"
          variants={reducedMotion ? undefined : staggerContainer}
        >
          <motion.p
            className="font-dm-sans text-label uppercase tracking-[0.2em] text-gold"
            transition={{ delay: 0.05 }}
            variants={fadeUpVariant}
          >
            {slides[activeSlide]?.label}
          </motion.p>
          <motion.h1
            className="font-cormorant text-display-lg font-light text-ivory sm:text-display-xl"
            transition={{ delay: 0.12 }}
            variants={fadeUpVariant}
          >
            {slides[activeSlide]?.headline}
          </motion.h1>
          <motion.p
            className="max-w-xl font-dm-sans text-body text-ivory/80 md:text-body-lg"
            transition={{ delay: 0.2 }}
            variants={fadeUpVariant}
          >
            {slides[activeSlide]?.subtitle}
          </motion.p>
          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            transition={{ delay: 0.28 }}
            variants={fadeUpVariant}
          >
            <Link
              className="flex min-h-11 items-center justify-center rounded-sm bg-gold px-6 py-3 font-dm-sans text-label uppercase tracking-[0.18em] text-obsidian hover:bg-bark hover:text-ivory"
              href="/shop"
            >
              Shop Now
            </Link>
            <Link
              className="flex min-h-11 items-center justify-center rounded-sm border border-gold px-6 py-3 font-dm-sans text-label uppercase tracking-[0.18em] text-gold hover:bg-gold hover:text-obsidian"
              href="/shop"
            >
              Explore Collections
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          {slides.map((slide, index) => (
            <button
              key={slide.label}
              aria-label={`Go to slide ${index + 1}`}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition-colors",
                activeSlide === index ? "bg-gold" : "bg-ivory/40",
              )}
              onClick={(): void => setActiveSlide(index)}
              type="button"
            />
          ))}
        </div>
        <motion.div
          animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
          className="flex flex-col items-center gap-2 text-ivory/70"
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
        >
          <span className="font-dm-sans text-caption uppercase tracking-[0.18em]">
            Scroll
          </span>
          <ChevronDown className="size-5" />
        </motion.div>
      </div>
    </motion.section>
  );
}
