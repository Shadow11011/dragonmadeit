"use client";

const STACK = [
  "Flux · image generation",
  "KokoroTTS / Edge TTS · voiceover",
  "FFmpeg · video assembly",
  "Late API · official TikTok posting",
  "n8n · workflow engine",
  "Next.js + Prisma · dashboard",
];

export function AboutPageContent() {
  return (
    <>
      <section className="sec-pad" style={{ textAlign: "center" }}>
        <div className="wrap">
          <div className="eyebrow">CH · ABOUT</div>
          <h1 className="h-display mt-6">
            One dev.
            <br />
            <span style={{ fontStyle: "italic", color: "var(--fire)" }}>One dragon.</span>
            <br />
            One mission.
          </h1>
          <p className="text-2 mt-6" style={{ fontSize: 18, maxWidth: 600, margin: "24px auto 0" }}>
            Automate faceless TikTok. No fluff. No agency overhead. Just the fire.
          </p>
        </div>
      </section>

      <section className="sec-pad-sm">
        <div className="wrap-narrow">
          <div className="card">
            <div className="chapter-label">WHY I BUILT THIS</div>
            <p className="text-2 mt-4" style={{ fontSize: 16, lineHeight: 1.75 }}>
              I got obsessed with faceless TikTok. The idea that you could build an audience and
              generate income without ever showing your face. That hooked me. But the reality? Hours
              scripting, recording voiceovers, editing clips, manually posting. A full-time job
              pretending to be passive income.
            </p>
            <p className="text-2 mt-4" style={{ fontSize: 16, lineHeight: 1.75 }}>
              So I built DragonMadeIt. An AI dragon that handles the whole pipeline, script to post,
              while I sleep. Now it&apos;s available to every side hustler who wants growth without
              the grind.
            </p>
          </div>

          <div className="mt-16">
            <div className="chapter-label">THE STACK</div>
            <p className="text-2 mt-4">
              No vague &quot;cutting-edge AI&quot; marketing. Here&apos;s exactly what powers your
              content:
            </p>
            <div
              className="mt-8 stack-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
            >
              {STACK.map((s) => (
                <div
                  key={s}
                  className="row gap-3 card"
                  style={{ padding: "14px 18px", fontSize: 13 }}
                >
                  <span style={{ color: "var(--fire)" }}>◆</span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16">
            <div className="chapter-label">THE MISSION</div>
            <h2 className="h1 mt-4">&ldquo;Built by one. Forged for many.&rdquo;</h2>
            <p className="text-2 mt-6" style={{ fontSize: 16 }}>
              Every feature exists because I needed it. No committee. No SaaS-bloat. If it
              doesn&apos;t make a TikTok more likely to hit, it doesn&apos;t ship.
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 600px) {
          .stack-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
