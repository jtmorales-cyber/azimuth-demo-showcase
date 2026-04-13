'use client';

import { usePortalStore } from '@/state/portalStore';
import SwipeCarousel from '@/components/ui/SwipeCarousel';
import GlassPanel from '@/components/ui/GlassPanel';
import MetricCard from '@/components/ui/MetricCard';
import FeatureRow from '@/components/ui/FeatureRow';
import NOVANarration from '@/components/ui/NOVANarration';

/**
 * S7: BASE Showcase — Wellness
 * Brand geometry: Sphere (visible via ToolNode in HubWorld)
 * Color temperature: 20% cyan / 30% amber with calm purple accent
 *
 * ═══════════════════════════════════════════════════════════════
 * TRAUMA-INFORMED DESIGN PRINCIPLES (from storyboard S7 design note)
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. No clinical language or medical imagery
 * 2. Warm color temperature communicates safety, not sterility
 * 3. Content validates without pitying (empathy, not sympathy — per NOVA persona)
 * 4. Crisis detection mentioned as capability, not demonstrated
 * 5. Longest audio crossfade (3s) when audio is added — slower = calmer
 *
 * The design itself is the message: "this is a safe space."
 * Critical: don't perform care — respect agency. This is the one showcase
 * where getting tone wrong has real consequences.
 *
 * Copy is verbatim from storyboard.md S7. Don't soften "mental health
 * conditions" — it's the honest reality and the storyboard uses it directly.
 *
 * 4 cards following BAB framework:
 *   Card 1: The Problem — validates the structural barrier, not individual failure
 *   Card 2: The Solution — meets you where you are
 *   Card 3: The Outcome — foundation for total wellness
 *   Card 4: NOVA's Take — no lectures, no resiliency PowerPoints
 */
export default function BASEShowcase() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const setCarouselIndex = usePortalStore((s) => s.setCarouselIndex);

  if (currentScene !== 'base') return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center pointer-events-auto"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="w-full max-w-2xl px-lg">
        <SwipeCarousel onIndexChange={setCarouselIndex}>
          {/* Card 1: The Problem (Before) — validates the structural barrier */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--sage-muted)', fontSize: 'var(--text-caption)' }}
              >
                The Barrier
              </div>
              <h2
                className="font-satoshi font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 1.25,
                  color: 'var(--peak-light)',
                }}
              >
                The People Who Need Help Most Are the Least Likely to Ask for It
              </h2>
              <p
                className="font-inter"
                style={{
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.7,
                  color: 'var(--silver)',
                }}
              >
                Stigma. Distrust. The fear that seeking help means weakness. 60% of
                veterans with mental health conditions don&#39;t seek treatment. The
                system&#39;s design doesn&#39;t help — clinical intake forms,
                impersonal interfaces, zero cultural competence.
              </p>
              <MetricCard
                value="60%"
                label="of veterans with mental health needs don't access care"
              />
            </div>
          </GlassPanel>

          {/* Card 2: The Solution (Bridge) — meets you where you are */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--calm-purple)', fontSize: 'var(--text-caption)' }}
              >
                The Approach
              </div>
              <h2
                className="font-satoshi font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 1.25,
                  color: 'var(--peak-light)',
                }}
              >
                BASE Meets You Where You Are — Not Where the System Wants You
              </h2>
              <p
                className="font-inter"
                style={{
                  fontSize: 'var(--text-body)',
                  lineHeight: 1.7,
                  color: 'var(--silver)',
                }}
              >
                Whole-health check-ins across mental, physical, and spiritual domains.
                Culturally competent. No clinical jargon. Confidential. Connects to
                human support when it matters.
              </p>
              <div className="pt-sm">
                <FeatureRow title="Whole health domains" />
                <FeatureRow title="Crisis pathway detection" />
                <FeatureRow title="Peer support connection" />
                <FeatureRow title="Wellness tracking" />
              </div>
            </div>
          </GlassPanel>

          {/* Card 3: The Outcome (After) — foundation for total wellness */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--amber-core)', fontSize: 'var(--text-caption)' }}
              >
                The Promise
              </div>
              <h2
                className="font-satoshi font-bold"
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 1.25,
                  color: 'var(--peak-light)',
                }}
              >
                Your Foundation for Total Wellness
              </h2>
              <div className="grid grid-cols-1 gap-md pt-sm">
                <MetricCard
                  value="Confidential"
                  label="check-ins on your schedule"
                />
                <MetricCard
                  value="Crisis detection"
                  label="that connects, doesn't diagnose"
                />
                <MetricCard
                  value="Whole health"
                  label="across all domains — not just mental"
                />
              </div>
            </div>
          </GlassPanel>

          {/* Card 4: NOVA's Take — no lectures, no resiliency PowerPoints */}
          <GlassPanel size="full" tiltOnTouch>
            <div className="space-y-lg p-md">
              <div
                className="font-inter font-medium tracking-wider uppercase"
                style={{ color: 'var(--amber-core)', fontSize: 'var(--text-caption)' }}
              >
                NOVA&#39;s Take
              </div>
              <NOVANarration
                text="BASE doesn't pretend to be a therapist. It's the check-in you actually do — because it respects your time, your privacy, and your agency. When something needs human attention, BASE connects you. That's it. No lectures. No 'Resiliency' Powerpoints."
                typing
              />
            </div>
          </GlassPanel>
        </SwipeCarousel>
      </div>
    </div>
  );
}
