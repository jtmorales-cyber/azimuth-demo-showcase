'use client';

import { usePortalStore } from '@/state/portalStore';
import SwipeCarousel from '@/components/ui/SwipeCarousel';
import GlassPanel from '@/components/ui/GlassPanel';
import MetricCard from '@/components/ui/MetricCard';
import FeatureRow from '@/components/ui/FeatureRow';
import NOVANarration from '@/components/ui/NOVANarration';

/**
 * S8: SCOUT Showcase — VA Claims
 * Brand geometry: Octahedron (visible via ToolNode in HubWorld)
 * Color temperature: 50% cyan / 20% amber (coolest, most analytical showcase)
 *
 * SCOUT is the flagship demo tool — highest-pain use case, strongest PAS
 * application. Content must carry the strongest emotional hooks without
 * performing veteran suffering. Copy is verbatim from storyboard S8.
 *
 * 4 cards following BAB framework:
 *   Card 1: The Problem — 67% denial rate, 125-day wait (strongest metric)
 *   Card 2: The Solution — 38 CFR cross-check, AI evidence strength
 *   Card 3: The Outcome — "Not hoping. Knowing." + Before/After table
 *   Card 4: NOVA's Take — flagship narration, longest of any showcase
 */

// Before/After comparison row component (unique to SCOUT Card 3)
function CompareRow({ before, after }: { before: string; after: string }) {
  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] gap-sm items-start py-sm"
      style={{ borderBottom: '1px solid rgba(82, 106, 130, 0.2)' }}
    >
      <div
        className="font-inter"
        style={{
          fontSize: 'var(--text-caption)',
          color: 'var(--slate-blue)',
          lineHeight: 1.4,
        }}
      >
        {before}
      </div>
      <div
        className="font-space-grotesk"
        style={{
          color: 'var(--cyan-struct)',
          fontSize: 'var(--text-body)',
          fontWeight: 600,
          paddingTop: 2,
        }}
      >
        →
      </div>
      <div
        className="font-inter"
        style={{
          fontSize: 'var(--text-caption)',
          color: 'var(--silver)',
          lineHeight: 1.4,
          fontWeight: 500,
        }}
      >
        {after}
      </div>
    </div>
  );
}

export default function SCOUTShowcase() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const setCarouselIndex = usePortalStore((s) => s.setCarouselIndex);

  if (currentScene !== 'scout') return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto">
      <div className="w-full max-w-2xl px-lg">
        <SwipeCarousel onIndexChange={setCarouselIndex}>
          {/* Card 1: The Problem (Before) */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--slate-blue)', fontSize: 'var(--text-caption)' }}
              >
                The Problem
              </div>
              <h2
                className="font-satoshi font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 1.2,
                  color: 'var(--peak-light)',
                }}
              >
                You Earned These Benefits in Uniform. Now You&#39;re Fighting
                Paperwork to Claim Them.
              </h2>
              <p
                className="font-inter"
                style={{
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.6,
                  color: 'var(--silver)',
                }}
              >
                2.4M veterans filed disability claims last year. 67% were denied on
                first submission. Not because they didn&#39;t qualify — because the
                paperwork wasn&#39;t complete. Missing one document triggers a
                6-month appeal. Rent doesn&#39;t pause. Medical bills don&#39;t wait.
                Families plan around an answer the VA takes 125 days to give.
              </p>
              <div className="grid grid-cols-3 gap-sm pt-sm">
                <MetricCard value="67%" label="initial denial rate" />
                <MetricCard value="125" suffix=" days" label="average wait" />
                <MetricCard value="6" suffix=" months" label="appeal cycle" />
              </div>
            </div>
          </GlassPanel>

          {/* Card 2: The Solution (Bridge) */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--cyan-struct)', fontSize: 'var(--text-caption)' }}
              >
                The Solution
              </div>
              <h2
                className="font-satoshi font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 1.2,
                  color: 'var(--peak-light)',
                }}
              >
                SCOUT Optimizes Your Claim Before You Submit
              </h2>
              <p
                className="font-inter"
                style={{
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.6,
                  color: 'var(--silver)',
                }}
              >
                Upload your evidence once. SCOUT&#39;s AI cross-checks it against
                38 CFR rating criteria and benchmarks drawn from public VA decisions
                — flagging every gap, weak nexus, and missing C&amp;P trigger before
                you file. You walk into the VA with a claim built the way approved
                claims are built.
              </p>
              <div className="pt-sm">
                <FeatureRow title="AI claims parser" />
                <FeatureRow title="Evidence strength meter" />
                <FeatureRow title="Optimization engine" />
                <FeatureRow title="Compliant claim generator" />
              </div>
            </div>
          </GlassPanel>

          {/* Card 3: The Outcome — "Not hoping. Knowing." + Before/After table */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-md p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--scout-blue)', fontSize: 'var(--text-caption)' }}
              >
                The Outcome
              </div>
              <h2
                className="font-satoshi font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 1.2,
                  color: 'var(--peak-light)',
                }}
              >
                Walk Into the VA Knowing Your Claim Is Ready
              </h2>
              <div
                className="font-space-grotesk italic"
                style={{
                  fontSize: 'var(--text-h3)',
                  lineHeight: 1.3,
                  color: 'var(--amber-core)',
                  fontWeight: 300,
                }}
              >
                Not hoping. Knowing.
              </div>
              <p
                className="font-inter"
                style={{
                  fontSize: 'var(--text-caption)',
                  lineHeight: 1.6,
                  color: 'var(--silver)',
                }}
              >
                SCOUT closes the gap that causes most denials: incomplete evidence.
                Every condition scored. Every CFR criterion mapped. Every missing
                document flagged. You file once, with confidence, instead of
                appealing for six months in the dark.
              </p>

              {/* Before → After comparison table */}
              <div className="pt-sm">
                <div
                  className="grid grid-cols-[1fr_auto_1fr] gap-sm pb-xs"
                  style={{ borderBottom: '1px solid rgba(0, 206, 209, 0.3)' }}
                >
                  <div
                    className="font-inter font-medium tracking-wider uppercase"
                    style={{ fontSize: '0.6875rem', color: 'var(--slate-blue)' }}
                  >
                    Before SCOUT
                  </div>
                  <div />
                  <div
                    className="font-inter font-medium tracking-wider uppercase"
                    style={{ fontSize: '0.6875rem', color: 'var(--cyan-struct)' }}
                  >
                    After SCOUT
                  </div>
                </div>
                <CompareRow
                  before="Guessing what the VA wants"
                  after="Evidence mapped to 38 CFR criteria"
                />
                <CompareRow
                  before="Hoping your claim is complete"
                  after="Red/yellow/green readiness on every condition"
                />
                <CompareRow
                  before="Finding out what's missing 125 days later"
                  after="Finding out before you hit submit"
                />
                <CompareRow
                  before="One missing document = 6-month appeal"
                  after="Gaps closed before filing"
                />
              </div>
            </div>
          </GlassPanel>

          {/* Card 4: NOVA's Take — flagship narration */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--amber-core)', fontSize: 'var(--text-caption)' }}
              >
                NOVA&#39;s Take
              </div>
              <NOVANarration
                text="SCOUT doesn't file your claim for you. It makes sure your claim is ready before you file it. Every document checked. Every gap identified. Every recommendation based on what actually gets approved. The VA doesn't deny qualified veterans — it denies incomplete paperwork. SCOUT fixes that."
                typing
              />
            </div>
          </GlassPanel>
        </SwipeCarousel>
      </div>
    </div>
  );
}
