"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const testimonials = [
  {
    name: "Dr. Suresh Iyer",
    role: "Senior Ophthalmologist, Chennai",
    initials: "SI",
    text: "Auberon's ophthalmic range has been my go-to for over five years. The antibiotic eye drops are consistently effective and my patients report excellent tolerance.",
  },
  {
    name: "Dr. Meena Agarwal",
    role: "Eye Specialist, Jaipur",
    initials: "MA",
    text: "The clinical documentation that comes with every product is exceptional. Dosage clarity, contraindications, composition — exactly what a prescribing physician needs.",
  },
  {
    name: "Dr. Vikram Nair",
    role: "Consultant Ophthalmologist, Kochi",
    initials: "VN",
    text: "I've been sourcing from Auberon since they expanded their ophthalmic line. The supply is reliable, quality is consistent, and the team is responsive for bulk orders.",
  },
  {
    name: "Dr. Arvind Sharma",
    role: "Ophthalmology Distributor, Delhi",
    initials: "AS",
    text: "Auberon's pricing is transparent and their delivery is always on time. As a distributor, that reliability is everything. We've never had a quality complaint from any of our clients.",
  },
  {
    name: "Dr. Priya Menon",
    role: "Cataract Surgeon, Bengaluru",
    initials: "PM",
    text: "The Moxifloxacin and Prednisolone combination from Auberon has been a staple in our post-op protocol. Patients recover faster and the tolerability is excellent across all age groups.",
  },
  {
    name: "Dr. Rajesh Kulkarni",
    role: "Senior Eye Specialist, Pune",
    initials: "RK",
    text: "What sets Auberon apart is their clinical documentation. Every product comes with detailed composition and contraindication data — exactly what we need for informed prescribing.",
  },
];

// Track = last 3 clones + 6 real + first 3 clones = 12 total
const track = [
  ...testimonials.slice(-3),
  ...testimonials,
  ...testimonials.slice(0, 3),
];

const N = testimonials.length; // 6
const CLONE_OFFSET = 3;        // 3 prepended clones

function Card({ t }: { t: typeof testimonials[0] }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)",
      borderRadius: "16px",
      padding: "32px",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      boxSizing: "border-box",
    }}>
      {/* Gold quote mark */}
      <div style={{ fontSize: "48px", lineHeight: 1, color: "#c9933a", opacity: 0.4, marginBottom: "20px", fontFamily: "Georgia, serif" }}>
        &ldquo;
      </div>
      {/* Quote text — flex:1 pushes author to bottom */}
      <p style={{ fontSize: "1rem", color: "white", lineHeight: 1.7, flex: 1 }}>
        {t.text}
      </p>
      {/* Author — pinned to bottom */}
      <div style={{
        display: "flex", alignItems: "center", gap: "14px",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        paddingTop: "24px", marginTop: "auto",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ color: "white", fontSize: "0.875rem", fontWeight: 600 }}>{t.initials}</span>
        </div>
        <div>
          <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "white", margin: 0 }}>{t.name}</p>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", margin: "3px 0 0" }}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}

function ArrowBtn({ onClick, dir }: { onClick: () => void; dir: "left" | "right" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={dir === "left" ? "Previous" : "Next"}
      style={{
        width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
        background: hovered ? "rgba(201,147,58,0.8)" : "rgba(26,39,68,0.7)",
        border: "1px solid rgba(255,255,255,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", alignSelf: "center",
        transition: "background 0.2s",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === "left"
          ? <polyline points="15,18 9,12 15,6" />
          : <polyline points="9,18 15,12 9,6" />}
      </svg>
    </button>
  );
}

export default function Testimonials() {
  // isMounted prevents hydration mismatch — server renders static grid, client renders carousel
  const [isMounted, setIsMounted] = useState(false);
  // trackPos is the index into `track` array; starts at CLONE_OFFSET (first real card)
  const [trackPos, setTrackPos] = useState(CLONE_OFFSET);
  const [animated, setAnimated] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const isPausedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const jumpingRef = useRef(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const perPage = isMobile ? 1 : 3;
  const cardWidthPct = 100 / perPage; // 33.333 desktop, 100 mobile
  // translateX for current trackPos: each card = cardWidthPct / track.length of total track
  const translateX = -(trackPos * (100 / track.length));

  const advance = useCallback(() => {
    if (jumpingRef.current) return;
    setAnimated(true);
    setTrackPos((p) => p + 1);
  }, []);

  const retreat = useCallback(() => {
    if (jumpingRef.current) return;
    setAnimated(true);
    setTrackPos((p) => p - 1);
  }, []);

  // Auto-scroll
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPausedRef.current) advance();
    }, 2500);
  }, [advance]);

  useEffect(() => {
    if (!isMounted) return;
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isMounted, startInterval]);

  // After transition ends: if in clone zone, silently jump to real position
  const handleTransitionEnd = useCallback(() => {
    const realEnd = CLONE_OFFSET + N; // 9
    let jump: number | null = null;
    if (trackPos < CLONE_OFFSET) jump = trackPos + N;
    else if (trackPos >= realEnd) jump = trackPos - N;
    if (jump !== null) {
      jumpingRef.current = true;
      setAnimated(false);
      setTrackPos(jump);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        jumpingRef.current = false;
        setAnimated(true);
      }));
    }
  }, [trackPos]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? advance() : retreat();
    touchStartX.current = null;
  };

  // Active dot: which real card is at leftmost visible position
  const activeDot = ((trackPos - CLONE_OFFSET) % N + N) % N;

  // ── Server render (isMounted false): static grid, no carousel ──────────────
  if (!isMounted) {
    return (
      <section style={{ background: "#1a2744", padding: "80px 0" }}>
        <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 2rem" }}>
          <p style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c9933a", marginBottom: "20px" }}>
            Testimonials
          </p>
          <h2 style={{ textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, color: "white", fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.12, marginBottom: "40px" }}>
            Trusted by ophthalmologists.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "24px" }}>
            {testimonials.slice(0, 3).map((t) => <Card key={t.name} t={t} />)}
          </div>
        </div>
      </section>
    );
  }

  // ── Client render: full carousel ────────────────────────────────────────────
  return (
    <section style={{ background: "#1a2744", padding: "80px 0" }}>
      <div style={{ maxWidth: "1080px", margin: "0 auto", padding: "0 2rem" }}>
        <p style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c9933a", marginBottom: "20px" }}>
          Testimonials
        </p>
        <h2 style={{ textAlign: "center", fontFamily: "var(--font-display)", fontWeight: 700, color: "white", fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.12, marginBottom: "40px" }}>
          Trusted by ophthalmologists.
        </h2>

        {/* Carousel: arrow | track | arrow */}
        <div
          style={{ display: "flex", alignItems: "stretch", gap: "16px" }}
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <ArrowBtn onClick={retreat} dir="left" />

          {/* Track viewport */}
          <div style={{ flex: 1, overflow: "hidden", padding: "2px" }}>
            {/* Track — all 12 cards in a row, align-items:stretch for equal height */}
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                width: `${(track.length / perPage) * 100}%`,
                transform: `translateX(${translateX}%)`,
                transition: animated ? "transform 0.4s ease-in-out" : "none",
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {track.map((t, i) => (
                <div
                  key={`${t.name}-${i}`}
                  style={{
                    width: `${100 / track.length}%`,
                    flexShrink: 0,
                    padding: "0 12px",
                    boxSizing: "border-box",
                    display: "flex",
                  }}
                >
                  <Card t={t} />
                </div>
              ))}
            </div>
          </div>

          <ArrowBtn onClick={advance} dir="right" />
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "32px" }}>
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setAnimated(true); setTrackPos(CLONE_OFFSET + i); }}
              aria-label={`Go to testimonial ${i + 1}`}
              style={{
                width: i === activeDot ? "10px" : "8px",
                height: i === activeDot ? "8px" : "8px",
                borderRadius: i === activeDot ? "4px" : "50%",
                background: i === activeDot ? "#c9933a" : "rgba(255,255,255,0.3)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
