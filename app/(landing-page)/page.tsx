import { SiteHeader } from "@/components/site-header";
import { HeroScroll } from "@/app/(landing-page)/(components)/hero-scroll";
import { WhyArcheSection } from "@/app/(landing-page)/(components)/why-arche-section";
import { CreativeSequenceCard } from "@/app/(landing-page)/(components)/creative-sequence-card";
import { TestimonialStackSection } from "@/app/(landing-page)/(components)/testimonial-stack-section";
import { ForArtistsSection } from "@/app/(landing-page)/(components)/for-artists-section";
import { GallerySection } from "@/app/(landing-page)/(components)/gallery-section";
import { QuoteSection } from "@/app/(landing-page)/(components)/quote-section";
import SplitText from "@/components/core/split-text";

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
        {/* Header */}
        <header className="section-header">
          <div className="mb-2">
            <SplitText
              text="Creative Process"
              tag="p"
              className="section-eyebrow"
              splitType="words"
              delay={30}
              duration={0.6}
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.2}
            />
          </div>
          <SplitText
            text="Your Creative Sequence"
            tag="h2"
            className="section-title"
            splitType="chars"
            delay={50}
            duration={0.8}
            from={{ opacity: 0, y: 60, rotateX: -90 }}
            to={{ opacity: 1, y: 0, rotateX: 0 }}
            threshold={0.3}
          />
          <SplitText
            text="Arche guides you through a gentle, deliberate flow — from imagination to on-chain permanence."
            tag="p"
            className="section-description"
            splitType="words"
            delay={30}
            duration={0.6}
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
          />
        </header>
        <div className="grid gap-6 md:grid-cols-3">
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

      {/* Section: Testimonials */}
      <TestimonialStackSection />

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
