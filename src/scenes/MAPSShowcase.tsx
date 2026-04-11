'use client';

import { usePortalStore } from '@/state/portalStore';
import SwipeCarousel from '@/components/ui/SwipeCarousel';
import GlassPanel from '@/components/ui/GlassPanel';
import MetricCard from '@/components/ui/MetricCard';
import FeatureRow from '@/components/ui/FeatureRow';
import NOVANarration from '@/components/ui/NOVANarration';

/**
 * S5: MAPS Showcase — Pre-Enlistment
 * Color temperature: 20% cyan / 60% amber (warmest showcase)
 * Brand geometry: Dodecahedron (visible via ToolNode in HubWorld)
 *
 * 4 cards following BAB (Before-After-Bridge) framework:
 *   Card 1: The Problem (Before)
 *   Card 2: The Solution (Bridge)
 *   Card 3: The Outcome (After)
 *   Card 4: NOVA's Take
 */
export default function MAPSShowcase() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const setCarouselIndex = usePortalStore((s) => s.setCarouselIndex);

  if (currentScene !== 'maps') return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-auto">
      <div className="w-full max-w-2xl px-lg">
        <SwipeCarousel onIndexChange={setCarouselIndex}>
          {/* Card 1: The Problem (Before) */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter text-caption font-medium tracking-wider uppercase"
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
                Choosing Your Path Shouldn&#39;t Feel Like Guessing
              </h2>
              <p
                className="font-inter"
                style={{
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.6,
                  color: 'var(--silver)',
                }}
              >
                200+ military career fields. No clear way to know which fits your
                strengths, interests, or goals. Most recruits choose based on a
                conversation — not data.
              </p>
              <MetricCard
                value="38%"
                label="of service members say their MOS matched their expectations"
              />
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
                MAPS Matches You to Careers That Actually Fit
              </h2>
              <p
                className="font-inter"
                style={{
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.6,
                  color: 'var(--silver)',
                }}
              >
                AI-powered aptitude alignment, branch/MOS recommendation, and career
                trajectory modeling — before you sign anything.
              </p>
              <div className="pt-sm">
                <FeatureRow title="ASVAB predictor" />
                <FeatureRow title="Branch comparison" />
                <FeatureRow title="Career path simulator" />
              </div>
            </div>
          </GlassPanel>

          {/* Card 3: The Outcome (After) */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--amber-core)', fontSize: 'var(--text-caption)' }}
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
                Enter Service With Eyes Open
              </h2>
              <div className="grid grid-cols-1 gap-md pt-sm">
                <MetricCard
                  value="Aptitude match"
                  label="score provided before enlistment"
                />
                <MetricCard
                  value="5/10/20 yr"
                  label="career path visibility across horizons"
                />
                <MetricCard
                  value="Branch comparison"
                  label="data for informed decisions"
                />
              </div>
            </div>
          </GlassPanel>

          {/* Card 4: NOVA's Take */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--amber-core)', fontSize: 'var(--text-caption)' }}
              >
                NOVA&#39;s Take
              </div>
              <NOVANarration
                text="Most people pick their MOS based on a recruiter's pitch and a 30-minute conversation. MAPS gives you the data to make that decision like it matters — because it does. This is the first 20 years of your career we're talking about."
                typing
              />
            </div>
          </GlassPanel>
        </SwipeCarousel>
      </div>
    </div>
  );
}
