import Link from "next/link";
import { Container } from "@/components/container";

export function Hero() {
  return (
    <section className="py-16">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#0C1B33] via-[#1B3F68] to-[#F8E473]/10 p-10 shadow-[0_0_60px_rgba(248,228,115,0.12)]">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 opacity-40 md:block">
            <div className="h-full w-full bg-[radial-gradient(circle_at_center,#F8E47333,transparent_55%)] blur-3xl" />
          </div>
          <div className="relative max-w-3xl space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-200/70">
              Story-ready studio
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl">
              Arche — The origin of every idea.
            </h1>
            <p className="text-base text-slate-200/80">
              Generate with AI, save every variation, and sign your final piece
              on Story Protocol. Arche keeps your journey illuminated in
              midnight blues and auric strokes inspired by Van Gogh.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/studio"
                className="rounded-full bg-yellow-300 px-6 py-2 text-sm font-medium text-slate-900 transition hover:bg-yellow-200"
              >
                Start creating
              </Link>
              <Link
                href="/timeline"
                className="text-sm text-slate-100/70 transition hover:text-white"
              >
                View timeline
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
