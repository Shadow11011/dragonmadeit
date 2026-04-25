"use client";

import { Reveal } from "@/components/marketing/primitives/Reveal";
import { Counter } from "@/components/marketing/primitives/Counter";

const TEST = {
  niches: [
    "Human Achievement",
    "Brotherhood Stories",
    "Street Smarts",
    "Bro Code",
    "Mother-in-Law Stories",
  ],
  days: 4,
  videos: 8,
  views: 263,
  likes: 10,
  profileViews: 12,
  shares: 1,
};

export function FoundersCaseStudy() {
  const { niches, days, videos, views, likes, profileViews, shares } = TEST;
  const viewsPerVideo = Math.round(views / videos);

  return (
    <section className="sec-pad" style={{ position: "relative", zIndex: 2 }}>
      <div className="wrap">
        <Reveal>
          <div className="chapter-label">FOUNDER&rsquo;S NOTE</div>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="h1 mt-8" style={{ maxWidth: 820 }}>
            I ran my own product through the front door.
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p
            className="text-2 mt-6"
            style={{ fontSize: 18, maxWidth: 640, textWrap: "pretty" }}
          >
            Signed up. Paid like every other customer. Picked {niches.length} niches from the{" "}
            <span style={{ color: "var(--accent)" }}>bro-story</span> cluster. Set the schedule.
            Walked away.
          </p>
        </Reveal>

        <Reveal delay={250}>
          <div
            className="row gap-3 mt-6 mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.15em",
              color: "var(--text-3)",
              flexWrap: "wrap",
            }}
          >
            {niches.map((n) => (
              <span
                key={n}
                style={{
                  border: "1px solid var(--border)",
                  padding: "4px 10px",
                  borderRadius: 2,
                }}
              >
                {n.toUpperCase()}
              </span>
            ))}
          </div>
        </Reveal>

        <div
          className="grid mt-16"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 32,
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
            padding: "32px 0",
          }}
        >
          <CaseStat to={days} label="DAYS ON AUTOPILOT" />
          <CaseStat to={videos} label="VIDEOS POSTED" />
          <CaseStat to={views} label="VIEWS" fire />
          <CaseStat to={viewsPerVideo} label="VIEWS / VIDEO" />
        </div>

        <Reveal delay={300}>
          <div
            className="row gap-6 mt-8 mono"
            style={{
              fontSize: 12,
              letterSpacing: "0.12em",
              color: "var(--text-3)",
              flexWrap: "wrap",
            }}
          >
            <span>◆ {likes} LIKES</span>
            <span>◆ {profileViews} PROFILE VIEWS</span>
            <span>◆ {shares} SHARE</span>
            <span style={{ color: "var(--accent)" }}>◆ STILL RUNNING</span>
          </div>
        </Reveal>

        <Reveal delay={350}>
          <div
            className="mono mt-16"
            style={{
              fontSize: 11,
              letterSpacing: "0.3em",
              color: "var(--text-3)",
            }}
          >
            THE VIDEOS, START TO FINISH
          </div>
          <p
            className="text-2 mt-4"
            style={{ fontSize: 16, maxWidth: 560, textWrap: "pretty" }}
          >
            Two of them, exactly as the pipeline spit them out &mdash; script, voiceover,
            visuals, edit. No camera was involved. Tap to watch.
          </p>
          <div
            className="clips-grid mt-8"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(200px, 320px))",
              gap: 24,
            }}
          >
            <figure style={{ margin: 0 }}>
              <video
                src="/videos/proof/clip-1.mp4"
                poster="/videos/proof/clip-1.jpg"
                controls
                playsInline
                preload="none"
                style={{
                  width: "100%",
                  aspectRatio: "9 / 16",
                  background: "#000",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                }}
              />
              <figcaption
                className="mono mt-3"
                style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-3)" }}
              >
                CLIP 01 &middot; 0:59
              </figcaption>
            </figure>
            <figure style={{ margin: 0 }}>
              <video
                src="/videos/proof/clip-2.mp4"
                poster="/videos/proof/clip-2.jpg"
                controls
                playsInline
                preload="none"
                style={{
                  width: "100%",
                  aspectRatio: "9 / 16",
                  background: "#000",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                }}
              />
              <figcaption
                className="mono mt-3"
                style={{ fontSize: 11, letterSpacing: "0.15em", color: "var(--text-3)" }}
              >
                CLIP 02 &middot; 1:15
              </figcaption>
            </figure>
          </div>
          <style jsx>{`
            @media (max-width: 560px) {
              .clips-grid {
                grid-template-columns: 1fr !important;
                max-width: 320px;
              }
            }
          `}</style>
        </Reveal>

        <Reveal delay={400}>
          <p
            className="mt-12"
            style={{
              fontSize: 13,
              maxWidth: 640,
              fontStyle: "italic",
              color: "var(--text-3)",
              textWrap: "pretty",
            }}
          >
            Day {days} of my own stress test. Real numbers from my real account &mdash; not
            industry averages, not a paid creator&rsquo;s highlight reel. TikTok&rsquo;s algorithm
            usually calibrates over 2&ndash;3 weeks; I&rsquo;ll keep this counter updated as it
            does. Your mileage will depend on niche, hook quality, and timing.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function CaseStat({
  to,
  label,
  fire,
}: {
  to: number;
  label: string;
  /** Renamed semantically: "highlight". Param name kept for callsite compat. */
  fire?: boolean;
}) {
  return (
    <div>
      <div
        className="counter"
        style={{ color: fire ? "var(--accent)" : "var(--text-1)" }}
      >
        <Counter to={to} />
      </div>
      <div
        className="mono mt-2"
        style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--text-3)" }}
      >
        {label}
      </div>
    </div>
  );
}
