import { SiteHeader } from "@/components/site-header";
import { HeroScroll } from "@/app/(landing-page)/(components)/hero-scroll";
import { WhyArcheSection } from "@/app/(landing-page)/(components)/why-arche-section";
import { CreativeSequenceCard } from "@/app/(landing-page)/(components)/creative-sequence-card";
import { ForArtistsSection } from "@/app/(landing-page)/(components)/for-artists-section";
import { GallerySection } from "@/app/(landing-page)/(components)/gallery-section";
import { QuoteSection } from "@/app/(landing-page)/(components)/quote-section";

export default function Page() {
  return (
    <>
      <SiteHeader revealOnScroll />
      <HeroScroll />

      {/* Section: Why Arche */}
      <div className="px-4 py-16 rounded-2xl">
        <WhyArcheSection />
      </div>

      <section className="mx-auto max-w-6xl bg-arche-navy px-4 py-16">
        <h3 className="text-2xl font-serif tracking-tight text-slate-50 md:text-3xl">
          Your creative sequence.
        </h3>
        <p className="mt-3 max-w-2xl text-sm text-slate-100/60 md:text-base">
          Arche guides you through a gentle, deliberate flow — from imagination
          to on-chain permanence.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Paint",
              desc: "Describe your scene, your mood, your emotion. Let the AI render it in seconds.",
            },
            {
              title: "Save",
              desc: "Each variation is kept as a version in your timeline. No idea is ever lost.",
            },
            {
              title: "Sign",
              desc: "Register the final piece on Story Protocol and make your authorship verifiable.",
            },
          ].map((step, idx) => (
            <CreativeSequenceCard
              key={step.title}
              title={step.title}
              desc={step.desc}
              index={idx}
            />
          ))}
        </div>
      </section>

      {/* Section: For builders & artists */}
      <div className="px-4 py-16">
        <ForArtistsSection />
      </div>

      {/* Section: Gallery */}
      <div className="px-4 py-16">
        <GallerySection />
      </div>

      {/* Section: Quote */}
      <div className="px-4 py-16">
        <QuoteSection
          eyebrow="inspiration"
          quote="I dream of painting and then I paint my dream."
          author="Vincent van Gogh"
        />
      </div>
    </>
  );
}
