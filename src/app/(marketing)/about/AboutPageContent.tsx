"use client";

const STACK = [
  "Flux · image generation",
  "KokoroTTS / Edge TTS · voiceover",
  "FFmpeg · video assembly",
  "Official platform APIs · posting",
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
            A content engine
            <br />
            <span style={{ fontStyle: "italic", color: "var(--fire)" }}>
              that runs itself.
            </span>
          </h1>
          <p className="text-2 mt-6" style={{ fontSize: 18, maxWidth: 620, margin: "24px auto 0" }}>
            Set it and leave. Generate, repurpose, or schedule short-form content across
            TikTok, Instagram Reels, and YouTube Shorts.
          </p>
        </div>
      </section>

      <section className="sec-pad-sm">
        <div className="wrap-narrow">
          <div className="card">
            <div className="chapter-label">WHY THIS EXISTS</div>
            <p className="text-2 mt-4" style={{ fontSize: 16, lineHeight: 1.75 }}>
              Short-form content works. The cost of running it well (scripting, voicing,
              editing, posting, five accounts, three platforms) does not. Most tools fix one
              step and hand the rest back to you. DragonMadeIt runs the whole loop: writes or
              ingests the content, assembles the video, posts on your cadence, and keeps
              going.
            </p>
          </div>

          <div className="card mt-8">
            <div className="chapter-label">WHO IT&rsquo;S FOR</div>
            <p className="text-2 mt-4" style={{ fontSize: 16, lineHeight: 1.75 }}>
              Small operators, hustlers, and affiliates building a brand or business on
              short-form. You want consistent output on TikTok, Instagram Reels, and YouTube
              Shorts without 10x the effort. You&rsquo;re not an agency, and you don&rsquo;t
              want to act like one.
            </p>
            <p className="text-2 mt-4" style={{ fontSize: 16, lineHeight: 1.75 }}>
              Three paths, one engine. Generate faceless videos from scratch if you
              don&rsquo;t have content. Repurpose your long-form if you do. Schedule your own
              shorts if you already make them. Pick any combination.
            </p>
          </div>

          <div className="mt-16">
            <div className="chapter-label">THE STACK</div>
            <p className="text-2 mt-4">
              The parts that move your content from idea to posted:
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
            <div className="chapter-label">A NOTE FROM THE BUILDER</div>
            <p className="text-2 mt-6" style={{ fontSize: 16, lineHeight: 1.75 }}>
              DragonMadeIt is built by one developer. Every feature shipped is a feature
              used. If it doesn&rsquo;t earn its place in the pipeline, it doesn&rsquo;t
              ship. Questions, bugs, and requests go straight to the person writing the
              code.
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
