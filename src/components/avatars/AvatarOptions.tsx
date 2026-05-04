import React from "react";

// Each avatar uses a unique clipPath id to avoid SVG id collisions when multiple render on the same page

// Avatar 1 — Short side-parted hair, navy bg, warm skin, teal shirt
function Av1({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="av1"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath="url(#av1)">
        <rect width="100" height="100" fill="#0B1F3A" />
        <rect x="20" y="72" width="60" height="35" rx="8" fill="#0D9488" />
        <rect x="42" y="62" width="16" height="14" fill="#D4A574" />
        <ellipse cx="50" cy="48" rx="22" ry="24" fill="#D4A574" />
        <path d="M28 42 Q30 22 50 22 Q70 22 72 42 Q68 28 50 28 Q34 28 28 42Z" fill="#2C1810" />
        <path d="M28 42 Q26 36 30 30 Q34 24 50 24" fill="none" stroke="#2C1810" strokeWidth="3" />
        <circle cx="42" cy="48" r="2.5" fill="#2C1810" />
        <circle cx="58" cy="48" r="2.5" fill="#2C1810" />
        <circle cx="43" cy="47" r="0.8" fill="white" />
        <circle cx="59" cy="47" r="0.8" fill="white" />
        <path d="M38 43 Q42 41 46 43" stroke="#2C1810" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M54 43 Q58 41 62 43" stroke="#2C1810" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M43 56 Q50 62 57 56" stroke="#A0522D" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M49 51 Q50 54 51 51" stroke="#A0522D" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Avatar 2 — Long wavy hair, gold bg, light skin, rose shirt
function Av2({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="av2"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath="url(#av2)">
        <rect width="100" height="100" fill="#C9963E" />
        <rect x="18" y="72" width="64" height="35" rx="8" fill="#E11D48" />
        <rect x="42" y="62" width="16" height="14" fill="#F5CBA7" />
        <ellipse cx="50" cy="48" rx="22" ry="24" fill="#F5CBA7" />
        <path d="M28 44 Q26 60 30 80 Q34 70 32 55 Q30 40 50 26 Q70 40 68 55 Q66 70 70 80 Q74 60 72 44 Q68 22 50 22 Q32 22 28 44Z" fill="#8B4513" />
        <circle cx="42" cy="48" r="2.5" fill="#2C1810" />
        <circle cx="58" cy="48" r="2.5" fill="#2C1810" />
        <circle cx="43" cy="47" r="0.8" fill="white" />
        <circle cx="59" cy="47" r="0.8" fill="white" />
        <path d="M38 43 Q42 41.5 46 43" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M54 43 Q58 41.5 62 43" stroke="#8B4513" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M43 56 Q50 62 57 56" stroke="#C0704A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M49 51 Q50 54 51 51" stroke="#C0704A" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Avatar 3 — Curly hair, teal bg, medium-dark skin, amber shirt
function Av3({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="av3"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath="url(#av3)">
        <rect width="100" height="100" fill="#0D9488" />
        <rect x="18" y="72" width="64" height="35" rx="8" fill="#D97706" />
        <rect x="42" y="62" width="16" height="14" fill="#C68642" />
        <ellipse cx="50" cy="48" rx="22" ry="24" fill="#C68642" />
        <circle cx="50" cy="26" r="10" fill="#1A0A00" />
        <circle cx="38" cy="30" r="9" fill="#1A0A00" />
        <circle cx="62" cy="30" r="9" fill="#1A0A00" />
        <circle cx="30" cy="40" r="8" fill="#1A0A00" />
        <circle cx="70" cy="40" r="8" fill="#1A0A00" />
        <circle cx="32" cy="52" r="7" fill="#1A0A00" />
        <circle cx="68" cy="52" r="7" fill="#1A0A00" />
        <circle cx="42" cy="24" r="8" fill="#1A0A00" />
        <circle cx="58" cy="24" r="8" fill="#1A0A00" />
        <circle cx="50" cy="22" r="8" fill="#1A0A00" />
        <circle cx="42" cy="48" r="2.5" fill="#1A0A00" />
        <circle cx="58" cy="48" r="2.5" fill="#1A0A00" />
        <circle cx="43" cy="47" r="0.8" fill="white" />
        <circle cx="59" cy="47" r="0.8" fill="white" />
        <path d="M38 43 Q42 41 46 43" stroke="#1A0A00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M54 43 Q58 41 62 43" stroke="#1A0A00" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M43 56 Q50 62 57 56" stroke="#8B5E3C" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M49 51 Q50 54 51 51" stroke="#8B5E3C" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Avatar 4 — Bun hairstyle, rose bg, light-warm skin, slate shirt
function Av4({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="av4"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath="url(#av4)">
        <rect width="100" height="100" fill="#E11D48" />
        <rect x="18" y="72" width="64" height="35" rx="8" fill="#475569" />
        <rect x="42" y="62" width="16" height="14" fill="#FDDCB5" />
        <ellipse cx="50" cy="48" rx="22" ry="24" fill="#FDDCB5" />
        <path d="M28 44 Q28 26 50 24 Q72 26 72 44 Q68 30 50 30 Q32 30 28 44Z" fill="#4A2C0A" />
        <circle cx="50" cy="22" r="9" fill="#4A2C0A" />
        <circle cx="50" cy="22" r="6" fill="#6B3F15" />
        <path d="M44 22 Q50 18 56 22" stroke="#4A2C0A" strokeWidth="1.5" fill="none" />
        <circle cx="42" cy="48" r="2.5" fill="#2C1810" />
        <circle cx="58" cy="48" r="2.5" fill="#2C1810" />
        <circle cx="43" cy="47" r="0.8" fill="white" />
        <circle cx="59" cy="47" r="0.8" fill="white" />
        <path d="M38 43 Q42 41 46 43" stroke="#4A2C0A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M54 43 Q58 41 62 43" stroke="#4A2C0A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M43 56 Q50 62 57 56" stroke="#B07040" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M49 51 Q50 54 51 51" stroke="#B07040" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Avatar 5 — Spiky hair, slate bg, warm-medium skin, teal shirt
function Av5({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="av5"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath="url(#av5)">
        <rect width="100" height="100" fill="#475569" />
        <rect x="18" y="72" width="64" height="35" rx="8" fill="#0D9488" />
        <rect x="42" y="62" width="16" height="14" fill="#D4956A" />
        <ellipse cx="50" cy="48" rx="22" ry="24" fill="#D4956A" />
        <path d="M28 40 L32 22 L36 36 L40 18 L44 34 L50 16 L56 34 L60 18 L64 36 L68 22 L72 40 Q68 26 50 26 Q32 26 28 40Z" fill="#1A1A1A" />
        <circle cx="42" cy="48" r="2.5" fill="#1A1A1A" />
        <circle cx="58" cy="48" r="2.5" fill="#1A1A1A" />
        <circle cx="43" cy="47" r="0.8" fill="white" />
        <circle cx="59" cy="47" r="0.8" fill="white" />
        <path d="M38 43 Q42 41 46 43" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M54 43 Q58 41 62 43" stroke="#1A1A1A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M43 56 Q50 62 57 56" stroke="#9B6040" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M49 51 Q50 54 51 51" stroke="#9B6040" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Avatar 6 — Buzzcut, amber bg, deep warm skin, navy shirt
function Av6({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="av6"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath="url(#av6)">
        <rect width="100" height="100" fill="#D97706" />
        <rect x="18" y="72" width="64" height="35" rx="8" fill="#0B1F3A" />
        <rect x="42" y="62" width="16" height="14" fill="#8B5E3C" />
        <ellipse cx="50" cy="48" rx="22" ry="24" fill="#8B5E3C" />
        <path d="M28 42 Q28 24 50 24 Q72 24 72 42 Q70 30 50 30 Q30 30 28 42Z" fill="#2C1A0E" />
        <path d="M28 42 Q27 38 29 34" stroke="#2C1A0E" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M72 42 Q73 38 71 34" stroke="#2C1A0E" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="42" cy="49" r="2.5" fill="#1A0A00" />
        <circle cx="58" cy="49" r="2.5" fill="#1A0A00" />
        <circle cx="43" cy="48" r="0.8" fill="white" />
        <circle cx="59" cy="48" r="0.8" fill="white" />
        <path d="M38 44 Q42 42 46 44" stroke="#2C1A0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M54 44 Q58 42 62 44" stroke="#2C1A0E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M43 57 Q50 63 57 57" stroke="#5C3010" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M49 52 Q50 55 51 52" stroke="#5C3010" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Avatar 7 — Panda Cheers 🐼
function Av7({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="av7"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath="url(#av7)">
        {/* soft bamboo-tinted white bg */}
        <rect width="100" height="100" fill="#EEF5EE" />
        {/* body / shirt */}
        <rect x="18" y="72" width="64" height="35" rx="8" fill="#2D2D2D" />
        {/* neck */}
        <rect x="42" y="63" width="16" height="12" fill="#F0F0F0" />
        {/* panda head */}
        <ellipse cx="50" cy="48" rx="24" ry="23" fill="#F5F5F5" />
        {/* big round black ear patches */}
        <circle cx="28" cy="30" r="11" fill="#1A1A1A" />
        <circle cx="72" cy="30" r="11" fill="#1A1A1A" />
        {/* inner ear */}
        <circle cx="28" cy="30" r="6" fill="#333" />
        <circle cx="72" cy="30" r="6" fill="#333" />
        {/* black eye patches */}
        <ellipse cx="40" cy="47" rx="9" ry="8" fill="#1A1A1A" />
        <ellipse cx="60" cy="47" rx="9" ry="8" fill="#1A1A1A" />
        {/* white eye whites */}
        <circle cx="40" cy="47" r="5" fill="white" />
        <circle cx="60" cy="47" r="5" fill="white" />
        {/* pupils */}
        <circle cx="41" cy="47" r="2.8" fill="#1A1A1A" />
        <circle cx="61" cy="47" r="2.8" fill="#1A1A1A" />
        {/* eye shine */}
        <circle cx="42" cy="46" r="1" fill="white" />
        <circle cx="62" cy="46" r="1" fill="white" />
        {/* nose */}
        <ellipse cx="50" cy="54" rx="4" ry="2.5" fill="#1A1A1A" />
        {/* big happy smile */}
        <path d="M42 59 Q50 67 58 59" stroke="#1A1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* cheek blush */}
        <ellipse cx="33" cy="56" rx="5" ry="3" fill="#FFB3B3" opacity="0.5" />
        <ellipse cx="67" cy="56" rx="5" ry="3" fill="#FFB3B3" opacity="0.5" />
        {/* right arm raised holding cup */}
        <path d="M74 68 Q82 58 80 50" stroke="#1A1A1A" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* cup */}
        <rect x="76" y="40" width="10" height="12" rx="2" fill="#F5A623" />
        <rect x="75" y="38" width="12" height="3" rx="1" fill="#E8951A" />
        {/* steam lines */}
        <path d="M79 36 Q80 33 79 30" stroke="#AAAAAA" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M83 35 Q84 32 83 29" stroke="#AAAAAA" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Avatar 8 — Croc with Goggles 🐊
function Av8({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="av8"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath="url(#av8)">
        {/* warm teal-green bg */}
        <rect width="100" height="100" fill="#1A6B5A" />
        {/* body */}
        <rect x="18" y="72" width="64" height="35" rx="8" fill="#145C4C" />
        {/* neck */}
        <rect x="40" y="63" width="20" height="12" fill="#2E8B6A" />
        {/* croc head — wider, flatter */}
        <ellipse cx="50" cy="50" rx="26" ry="20" fill="#2E8B6A" />
        {/* snout */}
        <ellipse cx="50" cy="60" rx="16" ry="8" fill="#2A7A5E" />
        {/* nostrils */}
        <circle cx="45" cy="58" r="2" fill="#1A5A44" />
        <circle cx="55" cy="58" r="2" fill="#1A5A44" />
        {/* teeth — toothy grin */}
        <rect x="38" y="64" width="4" height="5" rx="1" fill="white" />
        <rect x="44" y="65" width="4" height="4" rx="1" fill="white" />
        <rect x="52" y="65" width="4" height="4" rx="1" fill="white" />
        <rect x="58" y="64" width="4" height="5" rx="1" fill="white" />
        {/* smile line */}
        <path d="M36 64 Q50 72 64 64" stroke="#1A5A44" strokeWidth="1.5" fill="none" />
        {/* goggle frames pushed up on head */}
        <circle cx="38" cy="38" r="9" fill="none" stroke="#E8720C" strokeWidth="3" />
        <circle cx="62" cy="38" r="9" fill="none" stroke="#E8720C" strokeWidth="3" />
        {/* goggle lenses — orange tint */}
        <circle cx="38" cy="38" r="7" fill="#F5A62380" />
        <circle cx="62" cy="38" r="7" fill="#F5A62380" />
        {/* goggle bridge */}
        <path d="M47 38 L53 38" stroke="#E8720C" strokeWidth="3" strokeLinecap="round" />
        {/* goggle strap */}
        <path d="M29 38 Q20 42 22 50" stroke="#E8720C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M71 38 Q80 42 78 50" stroke="#E8720C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {/* eyes below goggles */}
        <circle cx="38" cy="48" r="4" fill="#1A1A1A" />
        <circle cx="62" cy="48" r="4" fill="#1A1A1A" />
        <circle cx="39" cy="47" r="1.5" fill="white" />
        <circle cx="63" cy="47" r="1.5" fill="white" />
        {/* scales texture hint */}
        <circle cx="50" cy="52" r="1.5" fill="#1A5A44" opacity="0.4" />
        <circle cx="44" cy="50" r="1.2" fill="#1A5A44" opacity="0.3" />
        <circle cx="56" cy="50" r="1.2" fill="#1A5A44" opacity="0.3" />
      </g>
    </svg>
  );
}

// ─── Default avatar ───────────────────────────────────────────────────────────
export function DefaultAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="avd"><circle cx="50" cy="50" r="50" /></clipPath></defs>
      <g clipPath="url(#avd)">
        <rect width="100" height="100" fill="#1E3A5F" />
        <rect x="18" y="72" width="64" height="35" rx="8" fill="#2D5A8E" />
        <rect x="42" y="62" width="16" height="14" fill="#D4A574" />
        <ellipse cx="50" cy="48" rx="22" ry="24" fill="#D4A574" />
        <path d="M28 44 Q28 24 50 24 Q72 24 72 44 Q68 28 50 28 Q32 28 28 44Z" fill="#2C1810" />
        <circle cx="42" cy="48" r="3" fill="#2C1810" />
        <circle cx="58" cy="48" r="3" fill="#2C1810" />
        <circle cx="43.2" cy="46.8" r="1" fill="white" />
        <circle cx="59.2" cy="46.8" r="1" fill="white" />
        <path d="M42 56 Q50 64 58 56" stroke="#A0522D" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M49 51 Q50 54 51 51" stroke="#A0522D" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <ellipse cx="37" cy="54" rx="4" ry="2.5" fill="#E8A090" opacity="0.35" />
        <ellipse cx="63" cy="54" rx="4" ry="2.5" fill="#E8A090" opacity="0.35" />
      </g>
    </svg>
  );
}

// ─── Avatar options array ─────────────────────────────────────────────────────
export const AVATAR_OPTIONS = [
  { key: "avatar-1", label: "Side-part",   Component: Av1 },
  { key: "avatar-2", label: "Wavy long",   Component: Av2 },
  { key: "avatar-3", label: "Curly",       Component: Av3 },
  { key: "avatar-4", label: "Bun",         Component: Av4 },
  { key: "avatar-5", label: "Spiky",       Component: Av5 },
  { key: "avatar-6", label: "Buzzcut",     Component: Av6 },
  { key: "avatar-7", label: "Panda",       Component: Av7 },
  { key: "avatar-8", label: "Croc",        Component: Av8 },
];

// ─── Universal render utility ─────────────────────────────────────────────────
export function renderAvatar(avatarValue: string | null | undefined, size: number): React.ReactElement {
  if (!avatarValue) return <DefaultAvatar size={size} />;

  if (avatarValue.startsWith("data:image")) {
    return (
      <img
        src={avatarValue}
        alt="Profile"
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", display: "block", flexShrink: 0 }}
      />
    );
  }

  const opt = AVATAR_OPTIONS.find((o) => o.key === avatarValue);
  if (opt) return <opt.Component size={size} />;

  return <DefaultAvatar size={size} />;
}
