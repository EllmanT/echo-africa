import type { CSSProperties } from "react";
import { SiGmail, SiGooglesheets, SiQuickbooks, SiWhatsapp } from "react-icons/si";

import { AMBER, AMBER_DK, BLUE, GMAIL, GREY, MUTE, QUICKBOOKS, SHEETS, Svg, W, W_THIN, WHATSAPP, d } from "./tokens";

const HUB = { x: 320, y: 256 };
const LOGO = 56;
const CYCLE_STEP = 1.6; // seconds each tool holds the spotlight, six of them make the 9.6s loop

const WebsiteGlyph = () => (
  <g>
    <circle r="25" fill={BLUE} fillOpacity="0.08" stroke={BLUE} strokeWidth={W} />
    <ellipse rx="10" ry="25" fill="none" stroke={BLUE} strokeWidth={W_THIN} />
    <path d="M-25 0 H25 M-21 -13 H21 M-21 13 H21" fill="none" stroke={BLUE} strokeWidth={W_THIN} />
  </g>
);

const StockGlyph = () => (
  <g strokeLinejoin="round" strokeLinecap="round">
    <path d="M0 -26 L23 -13 V13 L0 26 L-23 13 V-13 Z" fill={AMBER} fillOpacity="0.16" stroke={AMBER_DK} strokeWidth={W} />
    <path d="M-23 -13 L0 0 L23 -13 M0 0 V26" fill="none" stroke={AMBER_DK} strokeWidth={W} />
  </g>
);

type Spot = { x: number; y: number; label: string; above?: boolean; node: React.ReactNode };

const SPOTS: Spot[] = [
  { x: 320, y: 90, label: "Spreadsheet", above: true, node: <SiGooglesheets x={-LOGO / 2} y={-LOGO / 2} size={LOGO} color={SHEETS} /> },
  { x: 516, y: 178, label: "Email", node: <SiGmail x={-LOGO / 2} y={-LOGO / 2} size={LOGO} color={GMAIL} /> },
  { x: 516, y: 336, label: "Accounting", node: <SiQuickbooks x={-LOGO / 2} y={-LOGO / 2} size={LOGO} color={QUICKBOOKS} /> },
  { x: 320, y: 414, label: "Website", node: <WebsiteGlyph /> },
  { x: 124, y: 336, label: "Stock", node: <StockGlyph /> },
  { x: 124, y: 178, label: "WhatsApp", node: <SiWhatsapp x={-LOGO / 2} y={-LOGO / 2} size={LOGO} color={WHATSAPP} /> },
];

/** Six tools around the Eka mark, joined by thin dotted lines. Each tool takes a turn in the light. */
const IntegrationVisual = () => (
  <Svg>
    {SPOTS.map((s, i) => {
      const dxv = s.x - HUB.x;
      const dyv = s.y - HUB.y;
      const len = Math.hypot(dxv, dyv);
      const ux = dxv / len;
      const uy = dyv / len;
      return (
        <line
          key={i}
          x1={HUB.x + ux * 60}
          y1={HUB.y + uy * 60}
          x2={s.x - ux * 46}
          y2={s.y - uy * 46}
          stroke="#B4B8C6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="0.5 6"
        />
      );
    })}

    {/* the hub is the Eka mark: a tall dark pill beside a short light one */}
    <g className="fx a-pop" style={d(0)}>
      <circle cx={HUB.x} cy={HUB.y} r="46" fill="#fff" stroke={GREY} strokeWidth={W_THIN} />
      <rect x={HUB.x - 19} y={HUB.y - 25} width="16" height="50" rx="8" fill="#4B4F58" />
      <rect x={HUB.x + 5} y={HUB.y - 13} width="12" height="26" rx="6" fill="#D9DBE1" />
    </g>

    {SPOTS.map((s, i) => {
      const spot: CSSProperties = {
        transformBox: "view-box",
        transformOrigin: `${s.x}px ${s.y}px`,
        ["--d" as string]: `${1.2 + i * CYCLE_STEP}s`,
      };
      return (
        <g key={s.label} className="fx a-pop" style={d(0.1 + i * 0.12)}>
          <g className="a-spot" style={spot}>
            <g transform={`translate(${s.x} ${s.y})`}>{s.node}</g>
          </g>
          <text
            x={s.x}
            y={s.above ? s.y - 44 : s.y + 52}
            textAnchor="middle"
            fontSize="14"
            fontWeight="500"
            fill={MUTE}
            fontFamily="inherit"
          >
            {s.label}
          </text>
        </g>
      );
    })}
  </Svg>
);

export default IntegrationVisual;
