"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

import { landingImageUrls } from "@/lib/mock/media";
import SectionHeader from "@/components/shared/SectionHeader";
import { fadeUpVariant } from "@/lib/utils/animations";

const brandStoryParagraphs = [
  "Nairobi's fashion scene is alive, dynamic, and ever-evolving — and Wahi Fashion was created to be at the centre of it all. We saw a gap in the market: a woman who wanted more than what was on offer. More polish. More confidence. More range for every part of her life.",
  "She moves from boardroom mornings to rooftop evenings, from brunch in linen to heritage worn with quiet pride. Wahi exists for that full story — premium fashion that feels personal, modern, and unmistakably African without ever becoming costume.",
  "This is why every collection is curated with intention. Tailoring that holds presence. Occasionwear that earns a second glance. Traditional pieces given the same editorial respect as every other category. More than fashion. A lifestyle.",
];

export default function BrandStory(): ReactElement {
  return (
    <motion.section
      className="bg-cream px-6 py-16 md:px-8 md:py-24"
      id="about"
      initial="hidden"
      variants={fadeUpVariant}
      viewport={{ once: true, margin: "-80px" }}
      whileInView="visible"
    >
      <div className="mx-auto grid max-w-container gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative overflow-hidden rounded-md">
          <div className="relative aspect-[4/5]">
            <Image
              alt="Wahi Fashion editorial portrait"
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              src={landingImageUrls.brandStory}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-mahogany/45 via-transparent to-gold/15" />
          </div>
        </div>

        <div className="space-y-6">
          <SectionHeader
            label="Our Story"
            title="More Than Fashion. A Lifestyle."
            subtitle="Built in Nairobi for women who expect style to move with every chapter of their lives."
          />

          <div className="space-y-4">
            {brandStoryParagraphs.map((paragraph) => (
              <p key={paragraph} className="font-dm-sans text-body text-text-secondary">
                {paragraph}
              </p>
            ))}
          </div>

          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-sm border border-bark/30 px-6 py-3 font-dm-sans text-label uppercase tracking-[0.18em] text-obsidian hover:border-gold hover:text-gold"
            href="/shop"
          >
            Meet Wahi Fashion
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
