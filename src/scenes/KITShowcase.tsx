'use client';

import { usePortalStore } from '@/state/portalStore';
import SwipeCarousel from '@/components/ui/SwipeCarousel';
import GlassPanel from '@/components/ui/GlassPanel';
import ToolTitle from '@/components/ui/ToolTitle';
import MetricCard from '@/components/ui/MetricCard';
import FeatureRow from '@/components/ui/FeatureRow';
import NOVANarration from '@/components/ui/NOVANarration';

/**
 * S6: K.I.T. Showcase — Active Duty
 * Color temperature: 50% cyan / 30% amber (structured, cool — command center)
 * Brand geometry: Cube / Hexahedron (visible via ToolNode in HubWorld)
 *
 * Differentiation from MAPS:
 * Where MAPS feels like golden hour on a horizon, K.I.T. feels like the
 * inside of a command center — precise, structured, data-driven.
 *
 * 4 cards following BAB framework:
 *   Card 1: The Problem — 15 disconnected systems
 *   Card 2: The Solution — unified career tracker
 *   Card 3: The Outcome — never miss a promotion window
 *   Card 4: NOVA's Take — "nobody told me"
 */
export default function KITShowcase() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const setCarouselIndex = usePortalStore((s) => s.setCarouselIndex);
  const goTo = usePortalStore((s) => s.goTo);

  if (currentScene !== 'kit') return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center pointer-events-auto"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="w-full max-w-2xl px-lg">
        <SwipeCarousel onIndexChange={setCarouselIndex} onLastCardTap={() => goTo('hub')}>
          {/* Card 1: The Problem (Before) */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <ToolTitle name="K.I.T." />
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
                Your Career Data Lives in 15 Systems. None of Them Talk to Each Other.
              </h2>
              <p
                className="font-inter"
                style={{
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.6,
                  color: 'var(--silver)',
                }}
              >
                Promotion requirements in one portal. Training records in another.
                Certifications somewhere else. Your career is fragmented across systems
                that were never designed to connect.
              </p>
              <MetricCard
                value="15+"
                label="disconnected systems the average service member uses to manage their life and career"
              />
            </div>
          </GlassPanel>

          {/* Card 2: The Solution (Bridge) */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <ToolTitle name="K.I.T." />
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
                KIT Puts Your Entire Career in One Place
              </h2>
              <p
                className="font-inter"
                style={{
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.6,
                  color: 'var(--silver)',
                }}
              >
                Promotion tracker, certification timeline, policy alerts, career
                milestones — all unified. AI identifies gaps before they become
                problems.
              </p>
              <div className="pt-sm">
                <FeatureRow title="Career dashboard" />
                <FeatureRow title="Promotion predictor" />
                <FeatureRow title="Certification tracker" />
                <FeatureRow title="Policy alert feed" />
              </div>
            </div>
          </GlassPanel>

          {/* Card 3: The Outcome (After) */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <ToolTitle name="K.I.T." />
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
                Never Miss a Promotion Window Again
              </h2>
              <div className="grid grid-cols-1 gap-md pt-sm">
                <MetricCard
                  value="One dashboard"
                  label="for entire career"
                />
                <MetricCard
                  value="Proactive alerts"
                  label="for promotion windows and expiring certs"
                />
                <MetricCard
                  value="Career trajectory"
                  label="mapped against peer benchmarks"
                />
              </div>
            </div>
          </GlassPanel>

          {/* Card 4: NOVA's Take */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <ToolTitle name="K.I.T." />
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--amber-core)', fontSize: 'var(--text-caption)' }}
              >
                NOVA&#39;s Take
              </div>
              <NOVANarration
                text="The military has a phrase for what KIT solves: 'nobody told me.' How many careers stalled because someone missed an opportunity they didn't know existed? KIT makes sure that's never you."
                typing
              />
            </div>
          </GlassPanel>
        </SwipeCarousel>
      </div>
    </div>
  );
}
