/**
 * Six scenes for the "From idea to finished print" sequence. A blank sheet
 * becomes: brief → flyer → brochure (prepress) → imposed business cards →
 * booklet (finishing) → packaging (delivery). Drawn for a dark stage.
 */

const C = "#00A3E0";
const M = "#E5007E";
const Y = "#FFE500";
const K = "#1A1A1A";
const PAPER = "#FAFAF8";

function Shadow({ id }: { id: string }) {
  return (
    <filter id={id} x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#000" floodOpacity="0.45" />
    </filter>
  );
}

function FlyerArt({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const sx = (v: number) => x + v * w;
  const sy = (v: number) => y + v * h;
  return (
    <g>
      <g style={{ mixBlendMode: "multiply" }}>
        <polygon points={`${sx(0.1)},${sy(0.1)} ${sx(0.68)},${sy(0.06)} ${sx(0.5)},${sy(0.5)}`} fill={C} />
        <polygon points={`${sx(0.38)},${sy(0.08)} ${sx(0.9)},${sy(0.2)} ${sx(0.56)},${sy(0.56)}`} fill={M} />
        <polygon points={`${sx(0.16)},${sy(0.36)} ${sx(0.86)},${sy(0.34)} ${sx(0.5)},${sy(0.64)}`} fill={Y} />
      </g>
      <rect x={sx(0.1)} y={sy(0.7)} width={w * 0.6} height={h * 0.05} fill={K} />
      <rect x={sx(0.1)} y={sy(0.77)} width={w * 0.4} height={h * 0.05} fill={K} />
      <g fill={K} opacity={0.35}>
        <rect x={sx(0.1)} y={sy(0.87)} width={w * 0.55} height={1.6} />
        <rect x={sx(0.1)} y={sy(0.9)} width={w * 0.45} height={1.6} />
      </g>
    </g>
  );
}

export function JourneyScene({ index, uid }: { index: number; uid: string }) {
  const sh = `js-${uid}-${index}`;
  const common = { viewBox: "0 0 480 360", className: "h-full w-full", "aria-hidden": true as const };

  switch (index) {
    case 0: // IDEA — blank sheet + brief notes
      return (
        <svg {...common}>
          <defs><Shadow id={sh} /></defs>
          <rect x="150" y="50" width="180" height="250" fill={PAPER} filter={`url(#${sh})`} />
          <g stroke="#111" strokeOpacity="0.35" strokeWidth="1.2" fill="none" strokeLinecap="round">
            <path d="M172 90c20-6 40 4 60-2s40 2 60-4" />
            <path d="M172 112c24-4 48 3 72-1" />
            <rect x="172" y="140" width="136" height="80" strokeDasharray="4 5" />
            <path d="M190 200l28-32 22 20 18-14 32 26" />
            <path d="M172 244c30-3 60 2 96-2" />
          </g>
          <g transform="rotate(8 360 110)">
            <rect x="318" y="72" width="86" height="80" fill={Y} filter={`url(#${sh})`} />
            <g fill="#111" opacity="0.55"><rect x="330" y="92" width="56" height="3" /><rect x="330" y="102" width="44" height="3" /><rect x="330" y="112" width="50" height="3" /></g>
          </g>
          <g transform="rotate(-24 110 250)">
            <rect x="60" y="244" width="120" height="10" fill="#d9d4c7" />
            <polygon points="180,244 196,249 180,254" fill="#333" />
            <rect x="52" y="244" width="10" height="10" fill={M} />
          </g>
        </svg>
      );

    case 1: // DESIGN — flyer on a layout grid
      return (
        <svg {...common}>
          <defs><Shadow id={sh} /></defs>
          <g stroke={C} strokeOpacity="0.25">
            {Array.from({ length: 9 }).map((_, i) => (<line key={i} x1={60 + i * 45} y1="20" x2={60 + i * 45} y2="340" />))}
          </g>
          <rect x="150" y="40" width="180" height="270" fill={PAPER} filter={`url(#${sh})`} />
          <g stroke={C} strokeOpacity="0.5" strokeDasharray="2 3">
            {[0, 1, 2, 3].map((i) => (<line key={i} x1={168 + i * 48} y1="40" x2={168 + i * 48} y2="310" />))}
          </g>
          <FlyerArt x={150} y={40} w={180} h={270} />
          <g fill="#fff" opacity="0.8">
            <rect x="338" y="60" width="72" height="22" fill="none" stroke="#fff" strokeOpacity="0.3" />
            <text x="346" y="75" fontFamily="monospace" fontSize="9" fill="#fff" opacity="0.7">GRID 4 COL</text>
          </g>
          <path d="M338 180l30-14v28z" fill={M} />
        </svg>
      );

    case 2: // PREPRESS — tri-fold brochure with bleed, trim, safe, folds
      return (
        <svg {...common}>
          <defs><Shadow id={sh} /></defs>
          <rect x="60" y="80" width="360" height="200" fill={PAPER} filter={`url(#${sh})`} />
          <rect x="60" y="80" width="120" height="200" fill={C} opacity="0.9" />
          <g style={{ mixBlendMode: "multiply" }}>
            <polygon points="200,100 290,96 244,190" fill={M} />
            <polygon points="226,150 300,146 262,220" fill={Y} />
          </g>
          <rect x="200" y="236" width="90" height="8" fill={K} />
          <g fill={K} opacity="0.3">{[0, 1, 2, 3, 4, 5].map((i) => (<rect key={i} x="320" y={110 + i * 12} width="80" height="2" />))}</g>
          {/* bleed / trim / safe */}
          <rect x="52" y="72" width="376" height="216" fill="none" stroke={M} strokeDasharray="5 4" strokeWidth="1.2" />
          <rect x="72" y="92" width="336" height="176" fill="none" stroke={C} strokeDasharray="2 3" strokeWidth="1" />
          <line x1="180" y1="66" x2="180" y2="294" stroke="#fff" strokeOpacity="0.6" strokeDasharray="6 4" />
          <line x1="300" y1="66" x2="300" y2="294" stroke="#fff" strokeOpacity="0.6" strokeDasharray="6 4" />
          <g stroke="#fff" strokeOpacity="0.7">
            <path d="M60 60v12M48 80h12M420 60v12M432 80h-12M60 300v-12M48 280h12M420 300v-12M432 280h-12" />
          </g>
          <g fontFamily="monospace" fontSize="9" fill="#fff" opacity="0.7">
            <text x="52" y="316">BLEED</text><text x="110" y="316" fill={C}>SAFE</text><text x="160" y="316">FOLD</text><text x="206" y="316">TRIM</text>
          </g>
          <g transform="translate(330 306)">
            {[C, M, Y, K].map((c, i) => (<rect key={i} x={i * 22} y="0" width="16" height="16" fill={c} stroke={c === K ? "#555" : "none"} />))}
          </g>
        </svg>
      );

    case 3: // PRINT — imposed press sheet of business cards + color bar
      return (
        <svg {...common}>
          <defs><Shadow id={sh} /></defs>
          <rect x="70" y="30" width="340" height="300" fill={PAPER} filter={`url(#${sh})`} />
          {Array.from({ length: 8 }).map((_, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = 96 + col * 150;
            const y = 50 + row * 62;
            const dark = (i + row) % 2 === 0;
            return (
              <g key={i}>
                <rect x={x} y={y} width="138" height="54" fill={dark ? "#161616" : "#fff"} stroke="#111" strokeOpacity="0.08" />
                <g style={{ mixBlendMode: dark ? "normal" : "multiply" }}>
                  <polygon points={`${x + 10},${y + 10} ${x + 34},${y + 10} ${x + 24},${y + 30}`} fill={C} />
                  <polygon points={`${x + 20},${y + 10} ${x + 40},${y + 18} ${x + 26},${y + 34}`} fill={M} opacity="0.9" />
                </g>
                <rect x={x + 10} y={y + 40} width="60" height="4" fill={dark ? "#fff" : K} />
              </g>
            );
          })}
          <g>
            {[C, M, Y, K, "#089848", "#E87818", "#582888", C, M, Y, K, "#aaa", "#ddd", "#777"].map((c, i) => (
              <rect key={i} x={96 + i * 20.6} y="306" width="18" height="10" fill={c} />
            ))}
          </g>
          <g stroke="#111" strokeOpacity="0.6" fill="none">
            <circle cx="84" cy="180" r="5" /><path d="M84 170v20M74 180h20" />
            <circle cx="396" cy="180" r="5" /><path d="M396 170v20M386 180h20" />
          </g>
        </svg>
      );

    case 4: // FINISH — cut cards, folded booklet
      return (
        <svg {...common}>
          <defs><Shadow id={sh} /></defs>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`rotate(${-10 + i * 3} 130 250)`}>
              <rect x={60 + i * 2} y={210 - i * 4} width="140" height="80" fill={i === 3 ? "#161616" : PAPER} filter={`url(#${sh})`} />
            </g>
          ))}
          <g transform="rotate(-1 130 250)">
            <polygon points="72,200 92,200 84,216" fill={C} />
            <rect x="72" y="262" width="60" height="4" fill="#fff" />
          </g>
          <polygon points="250,70 330,56 330,300 250,296" fill="#eceae4" filter={`url(#${sh})`} />
          <polygon points="330,56 420,70 420,300 330,300" fill={PAPER} filter={`url(#${sh})`} />
          <polygon points="330,56 420,70 420,170 330,156" fill={M} opacity="0.9" />
          <g fill={K} opacity="0.3">{[0, 1, 2, 3, 4, 5, 6].map((i) => (<rect key={i} x="342" y={190 + i * 12} width="64" height="2" />))}</g>
          <g fill={K} opacity="0.2">{[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (<rect key={i} x="262" y={100 + i * 16} width="56" height="2" />))}</g>
          <line x1="330" y1="56" x2="330" y2="300" stroke="#111" strokeOpacity="0.25" />
          <path d="M330 318v12M330 26v12" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.2" />
          <g transform="translate(210 150)" stroke="#fff" strokeOpacity="0.55" fill="none">
            <circle cx="0" cy="0" r="7" /><circle cx="0" cy="18" r="7" /><path d="M5 5l26 22M5 13l26-12" />
          </g>
        </svg>
      );

    case 5: // DELIVER — packaging, labeled & stacked
    default:
      return (
        <svg {...common}>
          <defs><Shadow id={sh} /></defs>
          <g filter={`url(#${sh})`}>
            <polygon points="240,70 370,120 240,170 110,120" fill="#e9e5dc" />
            <polygon points="110,120 240,170 240,310 110,260" fill={PAPER} />
            <polygon points="240,170 370,120 370,260 240,310" fill="#161616" />
          </g>
          <polygon points="110,170 240,220 240,236 110,186" fill={C} />
          <polygon points="110,186 240,236 240,242 110,192" fill={M} />
          <polygon points="110,192 240,242 240,248 110,198" fill={Y} />
          <polygon points="262,188 344,156 344,212 262,244" fill={PAPER} />
          <g fill={K} opacity="0.6"><polygon points="272,196 320,177 320,181 272,200" /><polygon points="272,206 306,193 306,197 272,210" /></g>
          <polygon points="175,95 305,145 305,152 175,102" fill="#c9c2b2" />
          <g transform="translate(386 250)">
            <circle r="16" fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth="1.4" />
            <path d="M-7 0l5 5 9-10" stroke="#fff" strokeWidth="1.8" fill="none" />
          </g>
        </svg>
      );
  }
}
