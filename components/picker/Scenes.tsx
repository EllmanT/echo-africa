import type { CSSProperties } from "react";

import { AMBER, BLUE, CORAL, GREEN, GREY, INK, MUTE, PURPLE, W_THIN, WHATSAPP, YELLOW, RED } from "@/components/services/visuals/tokens";

/**
 * The six drawings behind the service tiles. Each is a small story that loops while the tile is on screen
 * (the picker sets data-play) and rests on its finished frame for visitors who prefer reduced motion.
 * Motion is transform and opacity only, defined as .pk-* in app/globals.css.
 */

const d = (s: number): CSSProperties => ({ ["--d" as string]: `${s}s` });

const Frame = ({ children, height = 200 }: { children: React.ReactNode; height?: number }) => (
  <svg viewBox={`0 0 320 ${height}`} className="h-full w-full" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

/** A page on a desktop, a phone beside it, and an enquiry arriving. */
export const WebScene = () => (
  <Frame>
    <rect x="14" y="30" width="214" height="146" rx="16" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
    <path d="M14 56 H228" stroke={GREY} strokeWidth={W_THIN} />
    {[RED, YELLOW, GREEN].map((c, i) => (
      <circle key={c} cx={32 + i * 14} cy="43" r="3.8" fill={c} />
    ))}
    <rect className="pk-bar" style={d(0)} x="34" y="76" width="124" height="11" rx="5.5" fill={INK} />
    <rect className="pk-bar" style={d(0.12)} x="34" y="94" width="88" height="11" rx="5.5" fill={BLUE} />
    <rect className="pk-bar" style={d(0.24)} x="34" y="116" width="150" height="6" rx="3" fill={GREY} />
    <rect className="pk-bar" style={d(0.3)} x="34" y="128" width="116" height="6" rx="3" fill={GREY} />
    <g className="pk-pulse" style={d(0.5)}>
      <rect x="34" y="146" width="72" height="20" rx="10" fill={BLUE} />
      <rect x="46" y="154" width="48" height="4" rx="2" fill="#fff" fillOpacity="0.9" />
    </g>

    <rect x="206" y="70" width="92" height="118" rx="18" fill="#fff" stroke={INK} strokeWidth="1.6" />
    <rect x="240" y="77" width="24" height="4" rx="2" fill={GREY} />
    <rect x="218" y="92" width="52" height="8" rx="4" fill={INK} />
    <rect x="218" y="106" width="38" height="8" rx="4" fill={BLUE} />
    <rect x="218" y="124" width="68" height="34" rx="9" fill={BLUE} fillOpacity="0.1" />
    <g className="pk-notif" style={d(0.4)}>
      <rect x="168" y="14" width="132" height="32" rx="16" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
      <circle cx="187" cy="30" r="9" fill={WHATSAPP} />
      <path d="M183 31 l3 3 5-6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <text x="203" y="34" fontSize="11" fontWeight="600" fill={INK} fontFamily="inherit">New enquiry</text>
    </g>
  </Frame>
);

/** Repeat tasks ticking themselves off while a spark node does the work. */
export const AutomationScene = () => (
  <Frame>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x="14" y={30 + i * 46} width="182" height="36" rx="13" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
        <rect x="52" y={42 + i * 46} width={[98, 80, 112][i]} height="7" rx="3.5" fill={INK} fillOpacity="0.85" />
        <rect x="52" y={54 + i * 46} width={[64, 90, 52][i]} height="5" rx="2.5" fill={GREY} />
        <circle cx="33" cy={48 + i * 46} r="9" fill="none" stroke={GREY} strokeWidth="1.6" />
        <g className="pk-tick" style={d(0.5 + i * 0.9)}>
          <circle cx="33" cy={48 + i * 46} r="9" fill={PURPLE} />
          <path d={`M28.5 ${48.5 + i * 46} l3.2 3.3 6-6.6`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <path d={`M196 ${48 + i * 46} H238`} stroke={PURPLE} strokeOpacity="0.35" strokeWidth="1.6" strokeDasharray="3 5" className="pk-flow" />
      </g>
    ))}
    <g className="pk-breathe">
      <rect x="236" y="62" width="68" height="76" rx="24" fill={PURPLE} />
      <circle className="pk-dot" style={d(0)} cx="256" cy="100" r="4.6" fill="#fff" />
      <circle className="pk-dot" style={d(0.16)} cx="270" cy="100" r="4.6" fill="#fff" />
      <circle className="pk-dot" style={d(0.32)} cx="284" cy="100" r="4.6" fill="#fff" />
    </g>
  </Frame>
);

/** Three tools exchanging information so nobody types it twice. */
export const IntegrationScene = () => {
  const links = ["M82 62 L150 100", "M238 62 L170 100", "M160 152 L160 116"];
  return (
    <Frame>
      {links.map((p, i) => (
        <path key={p} d={p} stroke={GREEN} strokeOpacity="0.45" strokeWidth="1.8" strokeDasharray="3 6" strokeLinecap="round" className="pk-flow" style={d(i * 0.3)} fill="none" />
      ))}
      <g className="pk-breathe">
        <circle cx="160" cy="104" r="22" fill={GREEN} fillOpacity="0.12" />
        <circle cx="160" cy="104" r="11" fill={GREEN} />
      </g>
      {/* chat */}
      <g className="pk-float" style={d(0)}>
        <rect x="42" y="30" width="54" height="54" rx="17" fill={WHATSAPP} />
        <path d="M58 47 h22 a5 5 0 0 1 5 5 v10 a5 5 0 0 1 -5 5 h-13 l-7 6 v-6 h-2 a5 5 0 0 1 -5 -5 v-10 a5 5 0 0 1 5 -5z" fill="#fff" />
      </g>
      {/* sheet */}
      <g className="pk-float" style={d(0.6)}>
        <rect x="224" y="30" width="54" height="54" rx="17" fill="#0F9D58" />
        <rect x="237" y="44" width="28" height="26" rx="3" fill="#fff" />
        <path d="M237 53 H265 M237 61.5 H265 M246.5 44 V70" stroke="#0F9D58" strokeWidth="1.6" />
      </g>
      {/* invoice */}
      <g className="pk-float" style={d(1.2)}>
        <rect x="133" y="140" width="54" height="54" rx="17" fill={INK} />
        <rect x="147" y="152" width="26" height="30" rx="4" fill="#fff" />
        <path d="M152 160 H168 M152 166 H168 M152 172 H161" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </Frame>
  );
};

/** A logo built from a few shapes, with its colours and lettering arriving beside it. */
export const LogoScene = () => (
  <div className="relative h-full w-full">
    <div className="absolute left-[12%] top-[18%] flex h-[58%] w-[34%] items-center justify-center">
      <span className="pk-morph block aspect-square w-full" style={{ backgroundColor: CORAL }} />
      <span className="absolute flex items-end gap-[6%]" style={{ height: "44%" }}>
        {[0.55, 1, 0.75].map((h, i) => (
          <span key={i} className="pk-mark block rounded-full bg-white" style={{ width: "0.5rem", height: `${h * 100}%`, ...d(i * 0.12) }} />
        ))}
      </span>
    </div>
    <div className="absolute right-[10%] top-[20%] flex flex-col items-start gap-3">
      <span className="font-display text-5xl font-extrabold leading-none tracking-[-0.04em]" style={{ color: INK }}>
        Aa
      </span>
      <span className="flex gap-2">
        {[CORAL, INK, AMBER, "#F3C6BE"].map((c, i) => (
          <span key={c} className="pk-swatch block h-6 w-6 rounded-full" style={{ backgroundColor: c, ...d(0.3 + i * 0.12) }} />
        ))}
      </span>
    </div>
  </div>
);

/** A small dashboard: bars rising, a switch flipping, rows filling. Software shaped to the work. Drawn wide, for the short tiles. */
export const SoftwareScene = () => (
  <Frame height={120}>
    <rect x="6" y="6" width="308" height="130" rx="18" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
    <rect x="24" y="22" width="74" height="10" rx="5" fill={INK} />
    <rect x="24" y="38" width="46" height="6" rx="3" fill={GREY} />
    <g>
      <rect x="252" y="20" width="44" height="22" rx="11" fill={AMBER} fillOpacity="0.25" />
      <circle className="pk-knob" cx="263" cy="31" r="8" fill={AMBER} />
    </g>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => {
      const h = [24, 40, 32, 54, 44, 64, 52][i];
      return <rect key={i} className="pk-rise" style={d(0.1 + i * 0.1)} x={26 + i * 24} y={110 - h} width="15" height={h} rx="5" fill={AMBER} fillOpacity={i === 5 ? 1 : 0.35} />;
    })}
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x="212" y={58 + i * 20} width="84" height="13" rx="6.5" fill="#F4F4F7" />
        <rect className="pk-fill" style={d(0.4 + i * 0.5)} x="212" y={58 + i * 20} width={[62, 44, 76][i]} height="13" rx="6.5" fill={AMBER} fillOpacity="0.85" />
      </g>
    ))}
  </Frame>
);

/** A question being asked, and an answer arriving. Large type on purpose: it is the only drawing with words. */
export const NotSureScene = () => (
  <Frame height={120}>
    <g className="pk-pop" style={d(0)}>
      <rect x="6" y="4" width="232" height="34" rx="17" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
      <text x="22" y="26" fontSize="14.5" fontWeight="600" fill={INK} fontFamily="inherit">Orders get lost on WhatsApp</text>
    </g>
    <g className="pk-pop" style={d(0.8)}>
      <rect x="6" y="46" width="58" height="26" rx="13" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
      <circle className="pk-dot" style={d(0)} cx="22" cy="59" r="3.4" fill={MUTE} />
      <circle className="pk-dot" style={d(0.16)} cx="35" cy="59" r="3.4" fill={MUTE} />
      <circle className="pk-dot" style={d(0.32)} cx="48" cy="59" r="3.4" fill={MUTE} />
    </g>
    <g className="pk-pop" style={d(1.8)}>
      <rect x="86" y="78" width="228" height="38" rx="19" fill={INK} />
      <circle cx="108" cy="97" r="11" fill={GREEN} />
      <path d="M103 97.5 l3.6 3.6 6.6-7.4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <text x="128" y="102" fontSize="15" fontWeight="700" fill="#fff" fontFamily="inherit">Here is your fix</text>
    </g>
  </Frame>
);
