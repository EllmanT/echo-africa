import type { CSSProperties } from "react";

// One animated drawing per service, in the same purple line-art language as the Playbook
// illustrations. Motion classes live in app/globals.css and only run while the panel is on
// screen (VisualFrame) and never for visitors who ask for reduced motion.

const P = "#7C3AED";
const PL = "#CBACF9";
const PB = "#EDE7FB";
const INK = "#191C21";
const MUTE = "#DDD8EA";

const d = (s: number): CSSProperties => ({ ["--d" as string]: `${s}s` });
const dx = (px: number, s = 0): CSSProperties => ({ ["--dx" as string]: `${px}px`, ["--d" as string]: `${s}s` });
const dy = (px: number, s = 0): CSSProperties => ({ ["--dy" as string]: `${px}px`, ["--d" as string]: `${s}s` });

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 640 512" className="h-full w-full" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

/** A website assembling itself on a desktop, with the same site arriving on a phone. */
export const WebVisual = () => (
  <Svg>
    <rect x="40" y="80" width="430" height="310" rx="24" fill="#fff" stroke={P} strokeWidth="5" />
    <path d="M40 104 a24 24 0 0 1 24 -24 h382 a24 24 0 0 1 24 24 v26 h-430 z" fill={PB} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={68 + i * 22} cy="106" r="6" fill={i === 0 ? P : PL} />
    ))}
    <rect x="180" y="93" width="190" height="26" rx="13" fill="#fff" />
    <rect className="fx-l a-growx" style={d(0.15)} x="72" y="158" width="250" height="24" rx="12" fill={P} />
    <rect className="fx-l a-growx" style={d(0.35)} x="72" y="196" width="200" height="12" rx="6" fill={PL} />
    <rect className="fx-l a-growx" style={d(0.45)} x="72" y="216" width="160" height="12" rx="6" fill={PL} />
    <g className="fx a-pop" style={d(0.8)}>
      <rect x="72" y="246" width="110" height="34" rx="17" fill={INK} />
      <rect x="92" y="259" width="70" height="8" rx="4" fill="#fff" opacity="0.9" />
    </g>
    <g className="fx a-pop" style={d(0.6)}>
      <rect x="340" y="152" width="100" height="128" rx="16" fill={PL} />
      <circle cx="390" cy="192" r="18" fill="#fff" opacity="0.85" />
      <path d="M340 268 L378 226 L410 256 L428 240 L440 254 V264 a16 16 0 0 1 -16 16 H356 a16 16 0 0 1 -16 -16 z" fill={P} opacity="0.55" />
    </g>
    {[0, 1, 2].map((i) => (
      <g key={i} className="fx a-pop" style={d(1 + i * 0.16)}>
        <rect x={72 + i * 130} y="304" width="114" height="62" rx="14" fill={PB} />
        <rect x={88 + i * 130} y="322" width="58" height="9" rx="4.5" fill={PL} />
        <rect x={88 + i * 130} y="340" width="82" height="9" rx="4.5" fill={MUTE} />
      </g>
    ))}

    <g className="fx a-pop" style={d(1.5)}>
      <rect x="392" y="150" width="184" height="330" rx="34" fill="#fff" stroke={INK} strokeWidth="6" />
      <rect x="464" y="164" width="40" height="8" rx="4" fill={MUTE} />
      <rect x="410" y="190" width="148" height="20" rx="10" fill={P} />
      <rect x="410" y="222" width="110" height="10" rx="5" fill={PL} />
      <rect x="410" y="244" width="148" height="86" rx="14" fill={PL} />
      <circle cx="446" cy="274" r="14" fill="#fff" opacity="0.85" />
      <rect x="410" y="344" width="148" height="34" rx="17" fill={INK} />
      <rect x="426" y="356" width="72" height="10" rx="5" fill="#fff" opacity="0.9" />
      <rect x="410" y="392" width="70" height="60" rx="12" fill={PB} />
      <rect x="488" y="392" width="70" height="60" rx="12" fill={PB} />
    </g>

    <g className="a-float" style={d(0.3)}>
      <rect x="150" y="30" width="118" height="36" rx="18" fill="#fff" stroke={P} strokeWidth="3.5" />
      <circle className="a-blink" cx="176" cy="48" r="6" fill={P} />
      <text x="192" y="54" fontSize="17" fontWeight="700" fill={INK} fontFamily="inherit">Live</text>
    </g>
    <g className="a-float" style={d(0.9)}>
      <path d="M262 318 L262 352 L271 344 L278 358 L285 355 L278 341 L290 341 Z" fill={INK} stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
    </g>
  </Svg>
);

const Node = ({
  x,
  y,
  w = 256,
  title,
  sub,
  icon,
  strong = false,
  delay,
}: {
  x: number;
  y: number;
  w?: number;
  title: string;
  sub: string;
  icon: React.ReactNode;
  strong?: boolean;
  delay: number;
}) => (
  <g className="fx a-pop" style={d(delay)}>
    <rect x={x} y={y} width={w} height="96" rx="24" fill={strong ? P : "#fff"} stroke={P} strokeWidth="4" />
    <circle cx={x + 44} cy={y + 48} r="26" fill={strong ? "#fff" : PB} />
    <g transform={`translate(${x + 44} ${y + 48})`}>{icon}</g>
    <text x={x + 84} y={y + 44} fontSize="19" fontWeight="700" fill={strong ? "#fff" : INK} fontFamily="inherit">
      {title}
    </text>
    <text x={x + 84} y={y + 67} fontSize="14" fill={strong ? "#fff" : "#6a6d7c"} opacity={strong ? 0.9 : 1} fontFamily="inherit">
      {sub}
    </text>
  </g>
);

/** A message comes in, AI reads it, an invoice is made, the customer is answered. */
export const AutomationVisual = () => (
  <Svg>
    {/* rails between the four steps */}
    <line x1="280" y1="130" x2="360" y2="130" stroke={MUTE} strokeWidth="5" strokeLinecap="round" />
    <line x1="488" y1="178" x2="488" y2="290" stroke={MUTE} strokeWidth="5" strokeLinecap="round" />
    <line x1="360" y1="338" x2="280" y2="338" stroke={MUTE} strokeWidth="5" strokeLinecap="round" />
    <circle className="a-travel" style={dx(80, 0.2)} cx="280" cy="130" r="8" fill={P} />
    <circle className="a-travely" style={dy(108, 1)} cx="488" cy="182" r="8" fill={P} />
    <circle className="a-travel" style={dx(-80, 1.8)} cx="360" cy="338" r="8" fill={P} />

    <Node
      x={24}
      y={82}
      title="New message"
      sub="Customer asks"
      delay={0}
      icon={<path d="M-13 -11 H13 a4 4 0 0 1 4 4 V6 a4 4 0 0 1 -4 4 H0 L-9 17 V10 H-13 a4 4 0 0 1 -4 -4 V-7 a4 4 0 0 1 4 -4 Z" fill={P} />}
    />
    <rect className="fx a-pulse" x="360" y="82" width="256" height="96" rx="24" fill="none" stroke={PL} strokeWidth="4" />
    <Node
      x={360}
      y={82}
      title="AI reads it"
      sub="Reads the request"
      strong
      delay={0.3}
      icon={<path d="M0 -15 L4.5 -4.5 L15 0 L4.5 4.5 L0 15 L-4.5 4.5 L-15 0 L-4.5 -4.5 Z" fill={P} />}
    />
    <Node
      x={360}
      y={290}
      title="Invoice made"
      sub="Filled in for you"
      delay={0.6}
      icon={
        <>
          <rect x="-11" y="-14" width="22" height="28" rx="4" fill={P} />
          <rect x="-6" y="-7" width="12" height="3.5" rx="1.75" fill="#fff" />
          <rect x="-6" y="0" width="8" height="3.5" rx="1.75" fill="#fff" />
        </>
      }
    />
    <Node
      x={24}
      y={290}
      title="Reply sent"
      sub="Customer gets a reply"
      delay={0.9}
      icon={<path d="M-11 0 L-3 8 L12 -9" fill="none" stroke={P} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />}
    />

    <g className="fx a-pop" style={d(1.4)}>
      <rect x="24" y="416" width="592" height="56" rx="28" fill={PB} />
      <circle cx="58" cy="444" r="12" fill={P} />
      <path d="M52 444 l4 4 8 -9" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="82" y="450" fontSize="18" fontWeight="600" fill={INK} fontFamily="inherit">A person checks anything that involves money</text>
    </g>
  </Svg>
);

const Tile = ({
  cx,
  cy,
  label,
  delay,
  children,
}: {
  cx: number;
  cy: number;
  label: string;
  delay: number;
  children: React.ReactNode;
}) => (
  <g className="fx a-pop" style={d(delay)}>
    <rect x={cx - 46} y={cy - 46} width="92" height="92" rx="24" fill="#fff" stroke={P} strokeWidth="4.5" />
    {children}
    <text x={cx} y={cy + 72} textAnchor="middle" fontSize="16" fontWeight="600" fill={INK} fontFamily="inherit">
      {label}
    </text>
  </g>
);

/** Six tools around a hub, joined by lines that carry information. */
export const IntegrationVisual = () => {
  const spots = [
    [320, 82],
    [516, 178],
    [516, 336],
    [320, 420],
    [124, 336],
    [124, 178],
  ];
  return (
    <Svg>
      {spots.map(([x, y], i) => (
        <line key={i} className="a-flow" x1="320" y1="256" x2={x} y2={y} stroke={P} strokeWidth="4" strokeLinecap="round" opacity="0.55" />
      ))}
      <circle className="fx a-pulse" cx="320" cy="256" r="68" fill="none" stroke={PL} strokeWidth="5" />
      <circle cx="320" cy="256" r="52" fill={P} />
      <path d="M298 256 H342 M328 240 L342 256 L328 272 M312 240 L298 256 L312 272" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

      <Tile cx={320} cy={82} label="Spreadsheet" delay={0.1}>
        <rect x="298" y="60" width="44" height="44" rx="6" fill="none" stroke={P} strokeWidth="4" />
        <path d="M298 75 H342 M298 89 H342 M313 60 V104" stroke={P} strokeWidth="3.5" />
      </Tile>
      <Tile cx={516} cy={178} label="WhatsApp" delay={0.25}>
        <path d="M516 152 a26 26 0 1 1 -13 48 l-12 4 4 -11 a26 26 0 0 1 21 -41 z" fill="none" stroke={P} strokeWidth="4" strokeLinejoin="round" />
        <circle cx="508" cy="178" r="3" fill={P} />
        <circle cx="518" cy="178" r="3" fill={P} />
        <circle cx="528" cy="178" r="3" fill={P} />
      </Tile>
      <Tile cx={516} cy={336} label="Accounting" delay={0.4}>
        <circle cx="516" cy="336" r="24" fill="none" stroke={P} strokeWidth="4" />
        <text x="516" y="347" textAnchor="middle" fontSize="30" fontWeight="800" fill={P} fontFamily="inherit">$</text>
      </Tile>
      <Tile cx={320} cy={420} label="Website" delay={0.55}>
        <rect x="296" y="402" width="48" height="36" rx="6" fill="none" stroke={P} strokeWidth="4" />
        <path d="M296 414 H344" stroke={P} strokeWidth="4" />
        <circle cx="304" cy="408" r="2" fill={P} />
      </Tile>
      <Tile cx={124} cy={336} label="Email" delay={0.7}>
        <rect x="100" y="322" width="48" height="34" rx="6" fill="none" stroke={P} strokeWidth="4" />
        <path d="M102 326 L124 344 L146 326" fill="none" stroke={P} strokeWidth="4" strokeLinejoin="round" />
      </Tile>
      <Tile cx={124} cy={178} label="Stock" delay={0.85}>
        <path d="M124 154 L146 166 V190 L124 202 L102 190 V166 Z M102 166 L124 178 L146 166 M124 178 V202" fill="none" stroke={P} strokeWidth="4" strokeLinejoin="round" />
      </Tile>
    </Svg>
  );
};

/** A custom dashboard: figures growing, a new order arriving, a task list ticking. */
export const SoftwareVisual = () => (
  <Svg>
    <rect x="40" y="56" width="560" height="400" rx="28" fill="#fff" stroke={P} strokeWidth="5" />
    <path d="M40 84 a28 28 0 0 1 28 -28 h112 v400 h-112 a28 28 0 0 1 -28 -28 z" fill={PB} />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x="64" y={96 + i * 54} width="64" height="34" rx="12" fill={i === 0 ? P : "#fff"} />
        <rect x="76" y={108 + i * 54} width="40" height="10" rx="5" fill={i === 0 ? "#fff" : PL} />
      </g>
    ))}
    {[0, 1, 2].map((i) => (
      <g key={i} className="fx a-pop" style={d(0.1 + i * 0.15)}>
        <rect x={204 + i * 128} y="82" width="112" height="72" rx="16" fill={PB} />
        <rect x={218 + i * 128} y="98" width="44" height="8" rx="4" fill={PL} />
        <rect x={218 + i * 128} y="118" width="72" height="18" rx="9" fill={i === 1 ? P : INK} />
      </g>
    ))}
    {[54, 86, 70, 112, 96, 138].map((h, i) => (
      <rect key={i} className="fx-b a-grow" style={d(0.4 + i * 0.1)} x={214 + i * 30} y={384 - h} width="20" height={h} rx="7" fill={i === 5 ? P : PL} />
    ))}
    <line x1="204" y1="386" x2="396" y2="386" stroke={MUTE} strokeWidth="4" strokeLinecap="round" />
    <rect x="424" y="176" width="150" height="240" rx="18" fill="#fff" stroke={MUTE} strokeWidth="4" />
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x="440" y={196 + i * 54} width="22" height="22" rx="7" fill={PB} stroke={P} strokeWidth="3" />
        <path className="a-draw" pathLength="1" style={d(1 + i * 0.4)} d={`M445 ${207 + i * 54} l4 4 8 -9`} fill="none" stroke={P} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="474" y={200 + i * 54} width={80 - i * 8} height="10" rx="5" fill={PL} />
        <rect x="474" y={218 + i * 54} width="52" height="8" rx="4" fill={MUTE} />
      </g>
    ))}
    <g className="a-float">
      <rect x="352" y="28" width="196" height="46" rx="23" fill={INK} />
      <circle cx="380" cy="51" r="10" fill={P} />
      <text x="400" y="57" fontSize="17" fontWeight="600" fill="#fff" fontFamily="inherit">New order in</text>
    </g>
  </Svg>
);

/** A logo being constructed on guides, then a palette, then real logos we drew. */
export const LogoVisual = () => (
  <Svg>
    <g transform="translate(0 -22)">
      <circle className="a-draw" pathLength="1" style={d(0)} cx="320" cy="190" r="132" fill="none" stroke={PL} strokeWidth="3" />
      <circle className="a-draw" pathLength="1" style={d(0.3)} cx="320" cy="190" r="86" fill="none" stroke={PL} strokeWidth="3" />
      <path className="a-draw" pathLength="1" style={d(0.5)} d="M170 190 H470 M320 40 V340" stroke={PL} strokeWidth="3" fill="none" />
      <path className="a-draw" pathLength="1" style={d(0.6)} d="M226 96 L414 284 M414 96 L226 284" stroke={PL} strokeWidth="3" fill="none" />
      <g className="fx a-pop" style={d(0.9)}>
        <rect x="262" y="132" width="116" height="116" rx="30" fill={P} transform="rotate(45 320 190)" />
      </g>
      <g className="fx a-pop" style={d(1.15)}>
        <circle cx="320" cy="190" r="28" fill="#fff" />
      </g>
      <g className="fx a-pop" style={d(1.35)}>
        <path d="M320 190 L320 162 A28 28 0 0 1 348 190 Z" fill={PL} />
      </g>
      <g className="fx a-pop" style={d(1.5)}>
        <rect x="252" y="352" width="136" height="14" rx="7" fill={INK} />
        <rect x="282" y="376" width="76" height="9" rx="4.5" fill={PL} />
      </g>
      {[P, PL, INK, PB].map((c, i) => (
        <circle key={i} className="fx a-pop" style={d(1.7 + i * 0.12)} cx={508 + (i % 2) * 44} cy={92 + Math.floor(i / 2) * 44} r="18" fill={c} stroke={MUTE} strokeWidth="2" />
      ))}
    </g>
    <g className="fx a-pop" style={d(2)}>
      <rect x="140" y="410" width="92" height="92" rx="24" fill="#fff" stroke={MUTE} strokeWidth="3" />
      <image href="/client-logos/kolkart_mining-clean.png" x="150" y="420" width="72" height="72" preserveAspectRatio="xMidYMid meet" />
    </g>
    <g className="fx a-pop" style={d(2.15)}>
      <rect x="250" y="410" width="250" height="92" rx="24" fill="#fff" stroke={MUTE} strokeWidth="3" />
      <image href="/client-logos/excogitate_logo-clean.png" x="268" y="420" width="214" height="72" preserveAspectRatio="xMidYMid meet" />
    </g>
  </Svg>
);
