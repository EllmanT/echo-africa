import type { CSSProperties, ReactElement } from "react";

// Drawn scenes for Playbook articles. One visual language: Eka purple line art on a
// soft tint, single stroke weight, motion limited to transform and opacity.
// Motion classes (a-pop, a-grow, ...) live in app/globals.css and only run while
// the figure is on screen and the visitor has not asked for reduced motion.

const P = "#7C3AED";
const PL = "#CBACF9";
const PB = "#EDE7FB";
const INK = "#191C21";
const MUTE = "#DDD8EA";

const d = (seconds: number): CSSProperties => ({ ["--d" as string]: `${seconds}s` });
const dx = (px: number, seconds = 0): CSSProperties => ({ ["--dx" as string]: `${px}px`, ["--d" as string]: `${seconds}s` });

const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 640 320" className="h-full w-full" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

const Speed = () => (
  <Svg>
    <path d="M200 240 A120 120 0 0 1 440 240" fill="none" stroke={PB} strokeWidth="22" strokeLinecap="round" />
    <path d="M200 240 A120 120 0 0 1 380 136" fill="none" stroke={P} strokeWidth="22" strokeLinecap="round" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const a = (Math.PI * i) / 6;
      const x1 = 320 - Math.cos(a) * 92;
      const y1 = 240 - Math.sin(a) * 92;
      const x2 = 320 - Math.cos(a) * 78;
      const y2 = 240 - Math.sin(a) * 78;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={PL} strokeWidth="4" strokeLinecap="round" />;
    })}
    <g className="a-sweep" style={{ transformBox: "view-box", transformOrigin: "320px 240px" }}>
      <line x1="320" y1="240" x2="320" y2="150" stroke={INK} strokeWidth="7" strokeLinecap="round" />
    </g>
    <circle cx="320" cy="240" r="14" fill={INK} />
    <rect x="200" y="278" width="240" height="12" rx="6" fill={PB} />
    <rect className="fx-l a-growx" style={d(0.2)} x="200" y="278" width="240" height="12" rx="6" fill={P} />
  </Svg>
);

const Phone = () => (
  <Svg>
    <rect x="240" y="20" width="160" height="280" rx="28" fill="#fff" stroke={P} strokeWidth="5" />
    <rect x="300" y="32" width="40" height="7" rx="3.5" fill={PB} />
    <g className="fx a-pop" style={d(0)}>
      <rect x="258" y="62" width="92" height="34" rx="17" fill={PB} />
      <rect x="272" y="76" width="56" height="7" rx="3.5" fill={PL} />
    </g>
    <g className="fx a-pop" style={d(0.45)}>
      <rect x="290" y="108" width="92" height="34" rx="17" fill={P} />
      <rect x="304" y="122" width="60" height="7" rx="3.5" fill="#fff" opacity="0.85" />
    </g>
    <g className="fx a-pop" style={d(0.9)}>
      <rect x="258" y="154" width="76" height="34" rx="17" fill={PB} />
      <rect x="272" y="168" width="44" height="7" rx="3.5" fill={PL} />
    </g>
    <g className="fx a-pop" style={d(1.35)}>
      <rect x="298" y="200" width="84" height="34" rx="17" fill={P} />
      <rect x="312" y="214" width="52" height="7" rx="3.5" fill="#fff" opacity="0.85" />
    </g>
    <circle className="fx a-pulse" cx="470" cy="120" r="30" fill="none" stroke={PL} strokeWidth="4" />
    <circle cx="470" cy="120" r="24" fill={P} />
    <path className="a-draw" pathLength="1" style={d(1.6)} d="M459 121 L467 129 L482 111" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const Search = () => (
  <Svg>
    <rect x="120" y="36" width="380" height="252" rx="20" fill="#fff" stroke={P} strokeWidth="5" />
    <rect x="146" y="58" width="250" height="30" rx="15" fill={PB} />
    <g className="fx a-pop" style={d(0.1)}>
      <rect x="146" y="106" width="328" height="58" rx="14" fill={PB} stroke={P} strokeWidth="3" />
      <circle cx="176" cy="135" r="15" fill={P} />
      <text x="176" y="141" textAnchor="middle" fontSize="17" fontWeight="700" fill="#fff" fontFamily="inherit">1</text>
      <rect x="204" y="122" width="190" height="9" rx="4.5" fill={P} />
      <rect x="204" y="141" width="130" height="8" rx="4" fill={PL} />
    </g>
    <g className="fx a-pop" style={d(0.35)}>
      <rect x="146" y="176" width="328" height="42" rx="12" fill="#fff" stroke={MUTE} strokeWidth="3" />
      <rect x="170" y="190" width="150" height="8" rx="4" fill={MUTE} />
    </g>
    <g className="fx a-pop" style={d(0.55)}>
      <rect x="146" y="230" width="328" height="42" rx="12" fill="#fff" stroke={MUTE} strokeWidth="3" />
      <rect x="170" y="244" width="110" height="8" rx="4" fill={MUTE} />
    </g>
    <g className="a-float">
      <circle cx="500" cy="96" r="36" fill="#fff" fillOpacity="0.6" stroke={INK} strokeWidth="7" />
      <line x1="526" y1="122" x2="556" y2="152" stroke={INK} strokeWidth="9" strokeLinecap="round" />
    </g>
  </Svg>
);

const Chart = () => (
  <Svg>
    <line x1="140" y1="40" x2="140" y2="272" stroke={MUTE} strokeWidth="4" strokeLinecap="round" />
    <line x1="140" y1="272" x2="520" y2="272" stroke={MUTE} strokeWidth="4" strokeLinecap="round" />
    {[52, 84, 74, 122, 164].map((h, i) => (
      <rect
        key={i}
        className="fx-b a-grow"
        style={d(i * 0.12)}
        x={172 + i * 70}
        y={268 - h}
        width="42"
        height={h}
        rx="10"
        fill={i === 4 ? P : PL}
      />
    ))}
    <path
      className="a-draw"
      pathLength="1"
      style={d(0.7)}
      d="M193 200 L263 170 L333 180 L403 130 L473 90"
      fill="none"
      stroke={INK}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle className="fx a-pulse" cx="473" cy="90" r="16" fill={PL} />
    <circle cx="473" cy="90" r="8" fill={INK} />
  </Svg>
);

const Automation = () => (
  <Svg>
    <line x1="200" y1="160" x2="250" y2="160" stroke={MUTE} strokeWidth="5" strokeLinecap="round" />
    <line x1="390" y1="160" x2="440" y2="160" stroke={MUTE} strokeWidth="5" strokeLinecap="round" />
    <rect x="50" y="118" width="150" height="84" rx="20" fill="#fff" stroke={P} strokeWidth="4" />
    <text x="125" y="166" textAnchor="middle" fontSize="16" fontWeight="700" fill={INK} fontFamily="inherit">New enquiry</text>
    <rect className="fx a-pulse" x="250" y="118" width="140" height="84" rx="20" fill="none" stroke={PL} strokeWidth="4" />
    <rect x="250" y="118" width="140" height="84" rx="20" fill={P} />
    <text x="320" y="166" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff" fontFamily="inherit">AI reads it</text>
    <rect x="440" y="118" width="150" height="84" rx="20" fill="#fff" stroke={P} strokeWidth="4" />
    <text x="515" y="166" textAnchor="middle" fontSize="16" fontWeight="700" fill={INK} fontFamily="inherit">Reply sent</text>
    <circle className="a-travel" style={dx(46, 0)} cx="200" cy="160" r="7" fill={P} />
    <circle className="a-travel" style={dx(46, 1.1)} cx="390" cy="160" r="7" fill={P} />
    <g transform="translate(0 44)">
      {[125, 320, 515].map((x, i) => (
        <g key={x} className="fx a-pop" style={d(0.4 + i * 0.4)}>
          <circle cx={x} cy="180" r="13" fill={PB} />
          <path d={`M${x - 6} 180 L${x - 1.5} 185 L${x + 7} 175`} fill="none" stroke={P} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
    </g>
  </Svg>
);

const Chat = () => (
  <Svg>
    <g className="fx a-pop" style={d(0)}>
      <circle cx="84" cy="88" r="22" fill={PL} />
      <rect x="120" y="56" width="270" height="62" rx="26" fill={PB} />
      <rect x="146" y="74" width="190" height="9" rx="4.5" fill={PL} />
      <rect x="146" y="92" width="120" height="9" rx="4.5" fill={PL} />
    </g>
    <g className="fx a-pop" style={d(0.55)}>
      <rect x="250" y="136" width="290" height="62" rx="26" fill={P} />
      <rect x="276" y="154" width="200" height="9" rx="4.5" fill="#fff" opacity="0.9" />
      <rect x="276" y="172" width="130" height="9" rx="4.5" fill="#fff" opacity="0.9" />
      <circle cx="574" cy="167" r="22" fill={P} opacity="0.35" />
    </g>
    <g className="fx a-pop" style={d(1.1)}>
      <circle cx="84" cy="248" r="22" fill={PL} />
      <rect x="120" y="222" width="170" height="52" rx="24" fill={PB} />
      {[0, 1, 2].map((i) => (
        <circle key={i} className="a-blink" style={d(i * 0.2)} cx={162 + i * 28} cy="248" r="7" fill={P} />
      ))}
    </g>
  </Svg>
);

const Shield = () => (
  <Svg>
    <circle className="fx a-pulse" cx="320" cy="164" r="128" fill="none" stroke={PL} strokeWidth="5" />
    <path
      d="M320 36 L436 78 V160 C436 222 384 266 320 290 C256 266 204 222 204 160 V78 Z"
      fill="#fff"
      stroke={P}
      strokeWidth="6"
      strokeLinejoin="round"
    />
    <path
      className="a-draw"
      pathLength="1"
      style={d(0.3)}
      d="M268 166 L306 204 L376 128"
      fill="none"
      stroke={P}
      strokeWidth="14"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Money = () => (
  <Svg>
    {[0, 1, 2, 3].map((i) => (
      <g key={i} className="fx a-pop" style={d(i * 0.22)}>
        <rect x="150" y={246 - i * 30} width="140" height="26" rx="13" fill={i === 3 ? P : PL} />
        <rect x="164" y={253 - i * 30} width="40" height="7" rx="3.5" fill="#fff" opacity="0.8" />
      </g>
    ))}
    <path d="M226 82 V44 M226 44 L208 62 M226 44 L244 62" fill="none" stroke={INK} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="a-float" />
    <g className="a-float" style={d(0.4)}>
      <rect x="360" y="84" width="190" height="130" rx="22" fill="#fff" stroke={P} strokeWidth="5" />
      <circle cx="388" cy="112" r="9" fill={PB} stroke={P} strokeWidth="3" />
      <text x="470" y="176" textAnchor="middle" fontSize="70" fontWeight="800" fill={P} fontFamily="inherit">$</text>
    </g>
  </Svg>
);

const Checklist = () => (
  <Svg>
    <rect x="110" y="24" width="420" height="272" rx="26" fill="#fff" stroke={P} strokeWidth="5" />
    {[0, 1, 2, 3].map((i) => {
      const y = 56 + i * 58;
      return (
        <g key={i}>
          <rect x="146" y={y} width="38" height="38" rx="11" fill={PB} stroke={P} strokeWidth="3.5" />
          <path
            className="a-draw"
            pathLength="1"
            style={d(0.3 + i * 0.45)}
            d={`M${155} ${y + 20} L${162} ${y + 27} L${176} ${y + 11}`}
            fill="none"
            stroke={P}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="204" y={y + 9} width={250 - i * 34} height="18" rx="9" fill={i === 3 ? MUTE : PB} />
        </g>
      );
    })}
  </Svg>
);

const Rocket = () => (
  <Svg>
    {[
      [150, 70, 0],
      [500, 100, 0.3],
      [200, 230, 0.6],
      [450, 250, 0.9],
      [540, 50, 1.2],
      [110, 160, 0.5],
    ].map(([x, y, delay]) => (
      <circle key={`${x}-${y}`} className="a-blink" style={d(delay)} cx={x} cy={y} r="4" fill={PL} />
    ))}
    <g className="a-float">
      <path d="M320 34 C356 78 358 150 344 204 H296 C282 150 284 78 320 34 Z" fill="#fff" stroke={P} strokeWidth="5" strokeLinejoin="round" />
      <circle cx="320" cy="112" r="18" fill={PB} stroke={P} strokeWidth="5" />
      <path d="M298 168 L262 216 L298 202 Z" fill={P} />
      <path d="M342 168 L378 216 L342 202 Z" fill={P} />
      <path className="a-blink" style={d(0)} d="M306 210 Q320 282 334 210 Z" fill={PL} />
    </g>
    <ellipse cx="320" cy="296" rx="120" ry="12" fill={PB} />
  </Svg>
);

const Clock = () => (
  <Svg>
    <circle className="fx a-pulse" cx="320" cy="160" r="112" fill="none" stroke={PL} strokeWidth="5" />
    <circle cx="320" cy="160" r="104" fill="#fff" stroke={P} strokeWidth="6" />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (Math.PI * 2 * i) / 12;
      return (
        <line
          key={i}
          x1={320 + Math.sin(a) * 84}
          y1={160 - Math.cos(a) * 84}
          x2={320 + Math.sin(a) * 94}
          y2={160 - Math.cos(a) * 94}
          stroke={i % 3 === 0 ? P : PL}
          strokeWidth={i % 3 === 0 ? 5 : 3.5}
          strokeLinecap="round"
        />
      );
    })}
    <g className="a-spin" style={{ transformBox: "view-box", transformOrigin: "320px 160px", animationDuration: "48s" }}>
      <line x1="320" y1="160" x2="320" y2="112" stroke={INK} strokeWidth="8" strokeLinecap="round" />
    </g>
    <g className="a-spin" style={{ transformBox: "view-box", transformOrigin: "320px 160px" }}>
      <line x1="320" y1="160" x2="320" y2="88" stroke={P} strokeWidth="6" strokeLinecap="round" />
    </g>
    <circle cx="320" cy="160" r="9" fill={INK} />
  </Svg>
);

const Website = () => (
  <Svg>
    <rect x="100" y="24" width="440" height="272" rx="22" fill="#fff" stroke={P} strokeWidth="5" />
    <path d="M100 46 a22 22 0 0 1 22 -22 h396 a22 22 0 0 1 22 22 v22 h-440 z" fill={PB} />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={128 + i * 20} cy="46" r="5" fill={i === 0 ? P : PL} />
    ))}
    <rect className="fx-l a-growx" style={d(0.1)} x="130" y="92" width="230" height="20" rx="10" fill={P} />
    <rect className="fx-l a-growx" style={d(0.3)} x="130" y="126" width="180" height="10" rx="5" fill={PL} />
    <rect className="fx-l a-growx" style={d(0.4)} x="130" y="144" width="140" height="10" rx="5" fill={PL} />
    <g className="fx a-pop" style={d(0.7)}>
      <rect x="130" y="170" width="96" height="30" rx="15" fill={INK} />
    </g>
    <g className="fx a-pop" style={d(0.5)}>
      <rect x="392" y="92" width="118" height="108" rx="16" fill={PL} />
      <circle cx="451" cy="130" r="16" fill="#fff" opacity="0.8" />
      <path d="M392 190 L432 152 L470 184 L490 168 L510 186 V184 a16 16 0 0 1 -16 16 H408 a16 16 0 0 1 -16 -16 z" fill={P} opacity="0.55" />
    </g>
    {[0, 1, 2].map((i) => (
      <g key={i} className="fx a-pop" style={d(0.9 + i * 0.18)}>
        <rect x={130 + i * 130} y="218" width="112" height="56" rx="14" fill={PB} />
        <rect x={146 + i * 130} y="234" width="56" height="8" rx="4" fill={PL} />
        <rect x={146 + i * 130} y="250" width="80" height="8" rx="4" fill={MUTE} />
      </g>
    ))}
    <g className="a-float" style={d(0.3)}>
      <path d="M214 196 L214 226 L222 219 L228 232 L234 229 L228 216 L238 216 Z" fill={INK} stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    </g>
  </Svg>
);

const Connect = () => (
  <Svg>
    {[
      [130, 70],
      [510, 70],
      [130, 250],
      [510, 250],
    ].map(([x, y], i) => (
      <g key={i}>
        <line
          className="a-draw"
          pathLength="1"
          style={d(0.1 + i * 0.15)}
          x1={x}
          y1={y}
          x2="320"
          y2="160"
          stroke={PL}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle className="fx a-pop" style={d(0.3 + i * 0.15)} cx={x} cy={y} r="34" fill="#fff" stroke={P} strokeWidth="5" />
        <circle className="a-blink" style={d(i * 0.3)} cx={x} cy={y} r="10" fill={P} />
      </g>
    ))}
    <circle className="fx a-pulse" cx="320" cy="160" r="60" fill="none" stroke={PL} strokeWidth="5" />
    <circle cx="320" cy="160" r="46" fill={P} />
    <path d="M300 160 H340 M326 146 L340 160 L326 174" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const Idea = () => (
  <Svg>
    <circle className="fx a-pulse" cx="320" cy="124" r="96" fill={PL} opacity="0.4" />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (Math.PI * 2 * i) / 8;
      return (
        <line
          key={i}
          className="a-blink"
          style={d(i * 0.15)}
          x1={320 + Math.cos(a) * 96}
          y1={124 + Math.sin(a) * 96}
          x2={320 + Math.cos(a) * 118}
          y2={124 + Math.sin(a) * 118}
          stroke={P}
          strokeWidth="6"
          strokeLinecap="round"
        />
      );
    })}
    <path d="M320 54 a70 70 0 0 1 36 130 v22 h-72 v-22 a70 70 0 0 1 36 -130 z" fill="#fff" stroke={P} strokeWidth="6" strokeLinejoin="round" />
    <path d="M300 140 L314 156 L320 130 L326 156 L340 140" fill="none" stroke={P} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="290" y="214" width="60" height="14" rx="7" fill={P} />
    <rect x="300" y="236" width="40" height="12" rx="6" fill={PL} />
  </Svg>
);

export const SCENES = {
  speed: Speed,
  phone: Phone,
  search: Search,
  chart: Chart,
  automation: Automation,
  chat: Chat,
  shield: Shield,
  money: Money,
  checklist: Checklist,
  rocket: Rocket,
  clock: Clock,
  website: Website,
  connect: Connect,
  idea: Idea,
} satisfies Record<string, () => ReactElement>;

export type SceneName = keyof typeof SCENES;
export const SCENE_NAMES = Object.keys(SCENES) as SceneName[];

/** One line per scene, so the article writer knows which drawing fits which idea. */
export const SCENE_GUIDE: Record<SceneName, string> = {
  speed: "page speed, loading time, performance",
  phone: "mobile phones, WhatsApp, messaging customers",
  search: "Google search, being found, ranking",
  chart: "growth, results, numbers going up, analytics",
  automation: "AI or software doing a repeat task step by step",
  chat: "customer questions and quick replies, chatbots",
  shield: "trust, safety, security, guarantees",
  money: "cost, price, saving or making money",
  checklist: "a list of things to do or check",
  rocket: "launching, starting, getting going",
  clock: "saving time, deadlines, hours won back",
  website: "a website, pages, design, getting online",
  connect: "connecting systems, tools, people or platforms",
  idea: "a tip, an insight, a smart trick",
};
